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

type ProfileOverview = {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  _count: {
    posts: number;
    follower: number;
    following: number;
  };
};

type PostOverview = {
  id: string;
  text: string;
  images: string[];
  profile: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
};

type Post = PostOverview & {
  createdAt: string;
  tags: string[];
  likes: string[];
  commentCount: number;
};

type PostComment = {
  id: string;
  text: string;
  createdAt: Date;
  parentId: string | null;
  profile: {
    avatar: string | null;
    id: string;
    username: string;
    name: string;
  };
};

export type { CloudinaryAsset, Post, PostOverview, ProfileOverview, User };
