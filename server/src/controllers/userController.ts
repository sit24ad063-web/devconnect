import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { toPublicUser } from "../utils/token";
import { sendSuccess, ApiError } from "../utils/apiResponse";
import type { PaginatedResult, PublicUser } from "@devconnect/shared";

/** Developer search & discovery — filter by skill/location, paginated. */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, skill, location, page = "1", pageSize = "12" } = req.query as Record<
      string,
      string
    >;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 12));

    const where: any = { AND: [] as any[] };

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { headline: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (location) {
      where.AND.push({ location: { contains: location, mode: "insensitive" } });
    }
    if (skill) {
      where.AND.push({
        userSkills: { some: { skill: { name: { contains: skill, mode: "insensitive" } } } },
      });
    }
    if (where.AND.length === 0) delete where.AND;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * size,
        take: size,
      }),
    ]);

    const result: PaginatedResult<PublicUser> = {
      items: users.map(toPublicUser),
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    };

    sendSuccess(res, result, "OK");
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        projects: { orderBy: { createdAt: "desc" } },
        posts: { where: { published: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) throw new ApiError("User not found", 404);

    const { projects, posts, ...rest } = user as any;
    sendSuccess(res, { user: { ...toPublicUser(rest), projects, posts } }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const allowed = [
      "name",
      "headline",
      "bio",
      "avatarUrl",
      "location",
      "githubUrl",
      "linkedinUrl",
      "websiteUrl",
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const user = await prisma.user.update({ where: { id: req.user!.id }, data });
    sendSuccess(res, { user: toPublicUser(user) }, "Profile updated");
  } catch (err) {
    next(err);
  }
}
