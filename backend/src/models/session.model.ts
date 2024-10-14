import { model, Schema } from "mongoose";

interface SessionDoc {
  _id: string;
  userId: string;
  expiresAt: Date;
}

const sessionSchema = new Schema<SessionDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false, timestamps: true }
);

const Session = model<SessionDoc>("Session", sessionSchema);

export { Session };
