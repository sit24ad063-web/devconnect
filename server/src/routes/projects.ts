import express from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, createProject);
router.put("/:id", requireAuth, updateProject);
router.delete("/:id", requireAuth, deleteProject);

export default router;
