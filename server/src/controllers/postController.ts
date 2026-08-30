import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { slugify } from "../utils/slugify";
import { sendSuccess, ApiError } from "../utils/apiResponse";

const authorSelect = { select: { id: true, name: true, avatarUrl: true, headline: true } };

function withCounts(post: any) {
  const { _count, ...rest } = post;
  return { ...rest, likeCount: _count?.likes ?? 0, commentCount: _count?.comments ?? 0 };
}

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { authorId, tag, search } = req.query as Record<string, string>;
    const where: any = { published: true };
    if (authorId) where.authorId = authorId;
    if (tag) where.tags = { contains: tag, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: authorSelect, _count: { select: { comments: true, likes: true } } },
    });
    sendSuccess(res, { posts: posts.map(withCounts) }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: authorSelect,
        comments: { include: { author: authorSelect }, orderBy: { createdAt: "asc" } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) throw new ApiError("Post not found", 404);
    sendSuccess(res, { post: withCounts(post) }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, coverImage, tags, published } = req.body;
    if (!title || !content) throw new ApiError("title and content are required", 400);

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content, // Markdown source, rendered client-side
        coverImage,
        tags,
        published: published !== undefined ? Boolean(published) : true,
        authorId: req.user!.id,
      },
    });
    sendSuccess(res, { post }, "Post published", 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError("Post not found", 404);
    if (existing.authorId !== req.user!.id) throw new ApiError("You do not own this post", 403);

    const allowed = ["title", "content", "coverImage", "tags", "published"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const post = await prisma.post.update({ where: { id: req.params.id }, data });
    sendSuccess(res, { post }, "Post updated");
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError("Post not found", 404);
    if (existing.authorId !== req.user!.id) throw new ApiError("You do not own this post", 403);

    await prisma.post.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Post deleted");
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = req.body;
    if (!content) throw new ApiError("content is required", 400);

    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new ApiError("Post not found", 404);

    const comment = await prisma.comment.create({
      data: { content, postId: post.id, authorId: req.user!.id },
      include: { author: authorSelect },
    });
    sendSuccess(res, { comment }, "Comment added", 201);
  } catch (err) {
    next(err);
  }
}

export async function toggleLike(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new ApiError("Post not found", 404);

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: post.id, userId: req.user!.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return sendSuccess(res, { liked: false }, "Like removed");
    }

    await prisma.like.create({ data: { postId: post.id, userId: req.user!.id } });
    sendSuccess(res, { liked: true }, "Post liked");
  } catch (err) {
    next(err);
  }
}
