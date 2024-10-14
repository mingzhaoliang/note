import { model, Schema, Types } from "mongoose";

interface PasswordResetDoc {
  _id: Types.ObjectId;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

const passwordResetSchema = new Schema<PasswordResetDoc>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

const PasswordReset = model<PasswordResetDoc>("PasswordReset", passwordResetSchema);

export { PasswordReset, type PasswordResetDoc };
