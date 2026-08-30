import express from "express";
import { endorseSkill, unendorseSkill } from "../controllers/skillController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.use(requireAuth);
router.post("/:userSkillId/endorse", endorseSkill);
router.delete("/:userSkillId/endorse", unendorseSkill);

export default router;
