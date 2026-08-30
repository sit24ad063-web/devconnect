import multer from "multer";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB — per brief: "images must be optimized, max 2MB"

// Memory storage: we stream straight to Cloudinary, never touch local disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});
