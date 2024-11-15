import authRoute from "@/features/auth/routes/auth.routes.js";
import conversationRoute from "@/features/conversation/routes/conversation.routes.js";
import notificationRoute from "@/features/notification/routes/notification.routes.js";
import passwordResetRoute from "@/features/passwordReset/routes/passwordReset.routes.js";
import postRoute from "@/features/post/routes/post.routes.js";
import profileRouter from "@/features/profile/routes/profile.routes.js";
import express from "express";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/reset-password", passwordResetRoute);
router.use("/profile", profileRouter);
router.use("/post", postRoute);
router.use("/conversation", conversationRoute);
router.use("/notification", notificationRoute);

export default router;
