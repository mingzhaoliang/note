import envConfig from "@/config/env.config.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

const uploadImage = async (
  data: string | File,
  options: { folder: string; backup?: boolean; publicId?: string }
) => {
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

  return uploadResult;
};

const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

const bulkDeleteImages = async (publicIds: string[]) => {
  await cloudinary.api.delete_resources(publicIds, { invalidate: true });
};

const restoreImages = async (publicIds: string[]) => {
  await cloudinary.api.restore(publicIds);
};

export { bulkDeleteImages, cloudinary, deleteImage, restoreImages, uploadImage };
