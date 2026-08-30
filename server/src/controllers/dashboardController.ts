import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess } from "../utils/apiResponse";
import type { DashboardData } from "@devconnect/shared";

const authorSelect = { select: { id: true, name: true, avatarUrl: true, headline: true } };

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const acceptedConnections = await prisma.connection.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    });
    const connectionIds = acceptedConnections.map((c: { requesterId: string; addresseeId: string }) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId
    );

    const [
      connectionCount,
      projectCount,
      postCount,
      mySkills,
      recentPosts,
      recentProjects,
      trendingPostsRaw,
      candidateUsers,
    ] = await Promise.all([
      Promise.resolve(acceptedConnections.length),
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.userSkill.findMany({ where: { userId }, include: { skill: true } }),
      prisma.post.findMany({
        where: { authorId: { in: connectionIds }, published: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { author: authorSelect, _count: { select: { likes: true, comments: true } } },
      }),
      prisma.project.findMany({
        where: { ownerId: { in: connectionIds } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { owner: authorSelect },
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
        take: 5,
        include: { author: authorSelect, _count: { select: { likes: true, comments: true } } },
      }),
      // Candidate pool for connection suggestions: anyone not already connected.
      prisma.user.findMany({
        where: {
          id: { notIn: [...connectionIds, userId] },
        },
        take: 25,
        orderBy: { createdAt: "desc" },
        include: { userSkills: { include: { skill: true } } },
      }),
    ]);

    const endorsementsReceived = await prisma.endorsement.count({
      where: { userSkill: { userId } },
    });

    const mySkillNames = new Set(mySkills.map((s: any) => s.skill.name.toLowerCase()));

    // Rank suggestions by shared-skill overlap, so recommendations feel relevant.
    const suggestions = candidateUsers
      .map((u: any) => {
        const overlap = u.userSkills.filter((us: any) =>
          mySkillNames.has(us.skill.name.toLowerCase())
        ).length;
        return { user: u, overlap };
      })
      .sort((a: { overlap: number }, b: { overlap: number }) => b.overlap - a.overlap)
      .slice(0, 6)
      .map(({ user }: { user: any }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        headline: user.headline,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        location: user.location,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        websiteUrl: user.websiteUrl,
        githubId: user.githubId,
        createdAt: user.createdAt.toISOString(),
      }));

    const activityFeed: DashboardData["activityFeed"] = [
      ...recentPosts.map((p: any) => ({
        type: "post" as const,
        item: {
          ...p,
          likeCount: p._count.likes,
          commentCount: p._count.comments,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        },
      })),
      ...recentProjects.map((p: any) => ({
        type: "project" as const,
        item: { ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() },
      })),
    ]
      .sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime())
      .slice(0, 15);

    const trendingPosts = trendingPostsRaw.map((p: any) => ({
      ...p,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const data: DashboardData = {
      stats: { connectionCount, projectCount, postCount, endorsementsReceived },
      activityFeed,
      connectionSuggestions: suggestions,
      trendingPosts,
    };

    sendSuccess(res, data, "OK");
  } catch (err) {
    next(err);
  }
}
