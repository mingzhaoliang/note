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

type Profile = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
};

type ProfileOverview = Profile & {
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
  postId: string;
  text: string;
  likes: string[];
  createdAt: string;
  profile: Profile;
  parentId: string | null;
  children?: PostComment[];
  childrenCount: number;
};

export type { CloudinaryAsset, Post, Comment, PostOverview, Profile, ProfileOverview, User };
