import express from "express";
import { uploadImage } from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/image", requireAuth, upload.single("image"), uploadImage);

export default router;
