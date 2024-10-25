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

type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
};

type BaseProfile = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
};

type Profile = BaseProfile & {
  follower: string[];
  following: string[];
  postCount: number;
};

type PostOverview = {
  id: string;
  text: string;
  images: string[];
  profile: Profile;
};

type Post = PostOverview & {
  createdAt: string;
  tags: string[];
  likes: string[];
  commentCount: number;
};

type Comment = {
  id: string;
  profile: Profile;
  text: string;
  likes: string[];
  commentOnId: string | null;
  commentCount: number;
  comments?: Comment[];
  createdAt: string;
};

export type { CloudinaryAsset, Comment, Post, PostOverview, BaseProfile, Profile, User };
