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

type BaseRelationship = {
  id: string;
  status?: "PENDING" | "CONFIRMED";
};

type Relationship = BaseRelationship & {
  profile: BaseProfile;
};

type User = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  deactivated: boolean;
  deactivatedAt: string | null;
  toBeDeletedAt: string | null;
  profile: {
    name: string;
    avatar: string;
    bio: string;
    private: boolean;
    follower: BaseRelationship[];
    following: BaseRelationship[];
  };
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
  _count: {
    follower: number;
    following: number;
  };
};

type PostOverview = {
  id: string;
  text: string;
  images: string[];
  profileId: string;
  profile: BaseProfile;
};

type Post = PostOverview & {
  createdAt: string;
  tags: string[];
  likes: string[];
  _count: {
    likes: number;
    comments: number;
  };
};

type Comment = {
  id: string;
  profile: BaseProfile;
  text: string;
  likes: string[];
  parentId: string | null;
  _count: {
    likes: number;
    comments: number;
  };
  comments?: Comment[];
  createdAt: string;
};

type ProfileComment = {
  id: string;
  text: string;
  profile: BaseProfile;
  likes: string[];
  parentId: string | null;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
  parent: {
    id: string;
    text: string;
    profile: BaseProfile;
    parentId: string | null;
    createdAt: string;
    _count: {
      likes: number;
      comments: number;
    };
    parent: { profile: BaseProfile } | null;
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

type ActionState<T> = { _action: T; message: string | null; data: any };

type Notification = {
  id: string;
  notificationTypeId: number;
  message: string;
  sender: Profile | null;
  relatedId: string | null;
  seen: boolean;
  createdAt: string;
};

export type {
  ActionState,
  BaseConversation,
  BaseProfile,
  BaseRelationship,
  CloudinaryAsset,
  Comment,
  Conversation,
  Message,
  Notification,
  Post,
  PostOverview,
  Profile,
  ProfileComment,
  Relationship,
  User,
};
