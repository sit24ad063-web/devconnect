import express from "express";
import {
  sendRequest,
  respondRequest,
  removeConnection,
  listMyConnections,
} from "../controllers/connectionController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.use(requireAuth);
router.get("/", listMyConnections);
router.post("/", sendRequest);
router.put("/:id", respondRequest);
router.delete("/:id", removeConnection);

export default router;
