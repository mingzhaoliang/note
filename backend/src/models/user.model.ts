import { model, Schema } from "mongoose";

interface UserDoc {
  _id: string;
  username: string;
  email: string;
  passwordHash?: string;
}

const userSchema = new Schema<UserDoc>(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
  } as const,
  { _id: false, timestamps: true }
);

const User = model<UserDoc>("User", userSchema);

export { User, type UserDoc };
