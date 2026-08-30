import { Request, Response, NextFunction } from "express";
import { uploadImageBuffer } from "../config/cloudinary";
import { sendSuccess, ApiError } from "../utils/apiResponse";

/** POST /api/uploads/image — multipart form field "image", max 2MB. */
export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ApiError("No image file provided (field name: image)", 400);

    const url = await uploadImageBuffer(req.file.buffer, "devconnect");
    sendSuccess(res, { url }, "Image uploaded", 201);
  } catch (err) {
    next(err);
  }
}
