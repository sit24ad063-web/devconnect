import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, ApiError } from "../utils/apiResponse";

const ownerSelect = { select: { id: true, name: true, avatarUrl: true, headline: true } };

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, featured } = req.query as Record<string, string>;
    const where: any = {};
    if (userId) where.ownerId = userId;
    if (featured === "true") where.featured = true;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { owner: ownerSelect },
    });
    sendSuccess(res, { projects }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { owner: ownerSelect },
    });
    if (!project) throw new ApiError("Project not found", 404);
    sendSuccess(res, { project }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, repoUrl, demoUrl, imageUrl, techStack, featured } = req.body;
    if (!title || !description) {
      throw new ApiError("title and description are required", 400);
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        repoUrl,
        demoUrl,
        imageUrl,
        techStack,
        featured: Boolean(featured),
        ownerId: req.user!.id,
      },
    });
    sendSuccess(res, { project }, "Project created", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError("Project not found", 404);
    if (existing.ownerId !== req.user!.id) throw new ApiError("You do not own this project", 403);

    const allowed = ["title", "description", "repoUrl", "demoUrl", "imageUrl", "techStack", "featured"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    sendSuccess(res, { project }, "Project updated");
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError("Project not found", 404);
    if (existing.ownerId !== req.user!.id) throw new ApiError("You do not own this project", 403);

    await prisma.project.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Project deleted");
  } catch (err) {
    next(err);
  }
}
