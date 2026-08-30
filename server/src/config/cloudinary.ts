import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

/**
 * Uploads an in-memory image buffer (from Multer) to Cloudinary and
 * returns the secure URL. Images are capped at 2MB by the Multer
 * middleware before they ever reach this function (see middleware/upload.ts).
 */
export function uploadImageBuffer(buffer: Buffer, folder = "devconnect"): Promise<string> {
  if (!isCloudinaryConfigured) {
    return Promise.reject(
      new Error(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
