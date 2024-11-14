import envConfig from "@/config/env.config.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  data: string | File,
  options: { folder: string; backup?: boolean; publicId?: string }
): Promise<CloudinaryAsset> {
  const uploadOptions = {
    upload_preset: envConfig.UPLOAD_PRESET,
    folder: options?.publicId ? undefined : options?.folder,
    invalidate: true,
    use_filename: true,
    backup: options?.backup || true,
    public_id: options?.publicId,
  };

  let uploadResult;

  if (typeof data === "string") {
    uploadResult = await cloudinary.uploader.upload(data, uploadOptions);
  } else {
    const buffer = Buffer.from(await data.arrayBuffer());

    uploadResult = await new Promise(async (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, uploadResult) => {
          if (error) return reject(error);
          return resolve(uploadResult);
        })
        .end(buffer);
    });
  }

  return uploadResult as CloudinaryAsset;
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export async function bulkDeleteImages(publicIds: string[]) {
  await cloudinary.api.delete_resources(publicIds, { invalidate: true });
}

export async function restoreImages(publicIds: string[]) {
  await cloudinary.api.restore(publicIds);
}

export type CloudinaryAsset = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: "image" | "raw" | "video" | "auto";
  created_at: string;
  tags: string[];
  bytes: number;
  type: "upload" | "authenticated" | "private";
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
};
