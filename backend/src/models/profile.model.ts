import { model, Schema, Types } from "mongoose";

interface ProfileDoc {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  avatar: string;
  followers: string[];
  following: string[];
  bio: string;
}

const profileSchema = new Schema<ProfileDoc>(
  {
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    followers: { type: [String], ref: "User", default: [] },
    following: { type: [String], ref: "User", default: [] },
    bio: { type: String, default: "" },
  } as const,
  { timestamps: true }
);

const Profile = model<ProfileDoc>("Profile", profileSchema);

export { Profile, type ProfileDoc };
