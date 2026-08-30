import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, ApiError } from "../utils/apiResponse";

const actorSelect = { select: { id: true, name: true, avatarUrl: true } };

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user!.id },
      include: { actor: actorSelect },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    sendSuccess(res, { notifications }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification) throw new ApiError("Notification not found", 404);
    if (notification.recipientId !== req.user!.id) throw new ApiError("Not your notification", 403);

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    sendSuccess(res, { notification: updated }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user!.id, read: false },
      data: { read: true },
    });
    sendSuccess(res, null, "All notifications marked read");
  } catch (err) {
    next(err);
  }
}
