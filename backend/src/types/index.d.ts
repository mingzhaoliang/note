type CloudinaryAsset = {
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

export type { CloudinaryAsset };
