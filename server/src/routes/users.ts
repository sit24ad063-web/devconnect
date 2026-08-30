import express from "express";
import { listUsers, getUserById, updateProfile } from "../controllers/userController";
import { listUserSkills, addSkill, removeSkill } from "../controllers/skillController";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.get("/:id/skills", optionalAuth, listUserSkills);

router.put("/me/profile", requireAuth, updateProfile);
router.post("/me/skills", requireAuth, addSkill);
router.delete("/me/skills/:userSkillId", requireAuth, removeSkill);

export default router;
