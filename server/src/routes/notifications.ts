import express from "express";
import {
  listNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.use(requireAuth);
router.get("/", listNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllRead);

export default router;
