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
  private: boolean;
};

type BaseProfile = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  private: boolean;
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

type ProfileComment = {
  id: string;
  text: string;
  profile: Profile;
  likes: string[];
  commentOnId: string | null;
  createdAt: string;
  commentCount: number;
  commentOn: {
    id: string;
    text: string;
    profile: Profile;
    commentOnId: string | null;
    createdAt: string;
    commentCount: number;
    commentOnUsername: string | null;
    images: string[];
    tags: string[];
    likes: string[];
  };
};

type BaseConversation = {
  id: string;
  participants: Profile[];
};

type Conversation = BaseConversation & {
  lastMessage: Message | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Profile;
  seen: boolean;
  seenAt: string | null;
  text: string;
  createdAt: string;
};

export type {
  BaseConversation,
  BaseProfile,
  CloudinaryAsset,
  Comment,
  Conversation,
  Message,
  Post,
  PostOverview,
  Profile,
  ProfileComment,
  User,
};
