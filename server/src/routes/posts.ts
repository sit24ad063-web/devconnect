import express from "express";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  toggleLike,
} from "../controllers/postController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", listPosts);
router.get("/:slug", getPost);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/comments", requireAuth, addComment);
router.post("/:id/like", requireAuth, toggleLike);

export default router;
