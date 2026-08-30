import express from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", requireAuth, getDashboard);

export default router;
