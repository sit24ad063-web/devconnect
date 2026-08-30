import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, ApiError } from "../utils/apiResponse";
import { notify } from "../utils/notify";

const userSelect = { select: { id: true, name: true, avatarUrl: true, headline: true } };

export async function sendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { addresseeId } = req.body;
    if (!addresseeId) throw new ApiError("addresseeId is required", 400);
    if (addresseeId === req.user!.id) throw new ApiError("You cannot connect with yourself", 400);

    const [me, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user!.id } }),
      prisma.user.findUnique({ where: { id: addresseeId } }),
    ]);
    if (!target) throw new ApiError("User not found", 404);

    const connection = await prisma.connection.create({
      data: { requesterId: req.user!.id, addresseeId, status: "PENDING" },
    });

    await notify({
      recipientId: addresseeId,
      actorId: req.user!.id,
      type: "CONNECTION_REQUEST",
      message: `${me?.name ?? "Someone"} sent you a connection request`,
    });

    sendSuccess(res, { connection }, "Connection request sent", 201);
  } catch (err) {
    next(err);
  }
}

export async function respondRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body; // "ACCEPTED" | "DECLINED"
    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      throw new ApiError("status must be ACCEPTED or DECLINED", 400);
    }

    const connection = await prisma.connection.findUnique({ where: { id: req.params.id } });
    if (!connection) throw new ApiError("Connection request not found", 404);
    if (connection.addresseeId !== req.user!.id) {
      throw new ApiError("This request was not sent to you", 403);
    }

    const updated = await prisma.connection.update({
      where: { id: req.params.id },
      data: { status },
    });

    if (status === "ACCEPTED") {
      const me = await prisma.user.findUnique({ where: { id: req.user!.id } });
      await notify({
        recipientId: connection.requesterId,
        actorId: req.user!.id,
        type: "CONNECTION_ACCEPTED",
        message: `${me?.name ?? "Someone"} accepted your connection request`,
      });
    }

    sendSuccess(res, { connection: updated }, "Connection updated");
  } catch (err) {
    next(err);
  }
}

export async function removeConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const connection = await prisma.connection.findUnique({ where: { id: req.params.id } });
    if (!connection) throw new ApiError("Connection not found", 404);
    if (![connection.requesterId, connection.addresseeId].includes(req.user!.id)) {
      throw new ApiError("Not part of this connection", 403);
    }

    await prisma.connection.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Connection removed");
  } catch (err) {
    next(err);
  }
}

export async function listMyConnections(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as Record<string, string>;
    const where: any = { OR: [{ requesterId: req.user!.id }, { addresseeId: req.user!.id }] };
    if (status) where.status = status;

    const connections = await prisma.connection.findMany({
      where,
      include: { requester: userSelect, addressee: userSelect },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, { connections }, "OK");
  } catch (err) {
    next(err);
  }
}
