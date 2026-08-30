import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, ApiError } from "../utils/apiResponse";
import { notify } from "../utils/notify";
import type { UserSkill } from "@devconnect/shared";

function shapeUserSkill(row: any, viewerId?: string): UserSkill {
  return {
    id: row.id,
    userId: row.userId,
    skillId: row.skillId,
    skill: { id: row.skill.id, name: row.skill.name },
    endorsementCount: row.endorsements?.length ?? row._count?.endorsements ?? 0,
    endorsedByMe: viewerId
      ? Boolean(row.endorsements?.some((e: any) => e.endorserId === viewerId))
      : false,
  };
}

/** GET /api/users/:id/skills — a user's skills with endorsement counts. */
export async function listUserSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const viewerId = req.user?.id;
    const rows = await prisma.userSkill.findMany({
      where: { userId: req.params.id },
      include: { skill: true, endorsements: true },
      orderBy: { endorsements: { _count: "desc" } },
    });
    sendSuccess(res, { skills: rows.map((r: any) => shapeUserSkill(r, viewerId)) }, "OK");
  } catch (err) {
    next(err);
  }
}

/** POST /api/users/me/skills — add a skill to your own profile. */
export async function addSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const name = (req.body.name || "").trim();
    if (!name) throw new ApiError("Skill name is required", 400);

    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    const existing = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId: req.user!.id, skillId: skill.id } },
    });
    if (existing) throw new ApiError("You already have this skill on your profile", 409);

    const userSkill = await prisma.userSkill.create({
      data: { userId: req.user!.id, skillId: skill.id },
      include: { skill: true, endorsements: true },
    });

    sendSuccess(res, { skill: shapeUserSkill(userSkill, req.user!.id) }, "Skill added", 201);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/me/skills/:userSkillId */
export async function removeSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const userSkill = await prisma.userSkill.findUnique({ where: { id: req.params.userSkillId } });
    if (!userSkill) throw new ApiError("Skill not found", 404);
    if (userSkill.userId !== req.user!.id) throw new ApiError("Not your skill", 403);

    await prisma.userSkill.delete({ where: { id: req.params.userSkillId } });
    sendSuccess(res, null, "Skill removed");
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/skills/:userSkillId/endorse — only connected developers can
 * endorse each other's skills (mirrors the LinkedIn-style trust model
 * called out in the brief).
 */
export async function endorseSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: req.params.userSkillId },
      include: { skill: true, user: true },
    });
    if (!userSkill) throw new ApiError("Skill not found", 404);
    if (userSkill.userId === req.user!.id) throw new ApiError("You cannot endorse your own skill", 400);

    const connection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: req.user!.id, addresseeId: userSkill.userId },
          { requesterId: userSkill.userId, addresseeId: req.user!.id },
        ],
      },
    });
    if (!connection) throw new ApiError("You can only endorse skills of your connections", 403);

    const existing = await prisma.endorsement.findUnique({
      where: { userSkillId_endorserId: { userSkillId: userSkill.id, endorserId: req.user!.id } },
    });
    if (existing) throw new ApiError("You already endorsed this skill", 409);

    await prisma.endorsement.create({
      data: { userSkillId: userSkill.id, endorserId: req.user!.id },
    });

    const me = await prisma.user.findUnique({ where: { id: req.user!.id } });
    await notify({
      recipientId: userSkill.userId,
      actorId: req.user!.id,
      type: "ENDORSEMENT",
      message: `${me?.name ?? "Someone"} endorsed you for ${userSkill.skill.name}`,
    });

    const updated = await prisma.userSkill.findUnique({
      where: { id: userSkill.id },
      include: { skill: true, endorsements: true },
    });

    sendSuccess(res, { skill: shapeUserSkill(updated, req.user!.id) }, "Skill endorsed", 201);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/skills/:userSkillId/endorse — remove your own endorsement. */
export async function unendorseSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.endorsement.findUnique({
      where: {
        userSkillId_endorserId: { userSkillId: req.params.userSkillId, endorserId: req.user!.id },
      },
    });
    if (!existing) throw new ApiError("Endorsement not found", 404);

    await prisma.endorsement.delete({ where: { id: existing.id } });
    sendSuccess(res, null, "Endorsement removed");
  } catch (err) {
    next(err);
  }
}
