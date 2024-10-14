import { googleLogin, googleLoginCallback } from "@/controllers/auth/auth-google.controller.js";
import {
  login,
  logout,
  resetPassword,
  signup,
  validateSession,
  verifyPasswordResetToken,
} from "@/controllers/auth/auth.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { loginSchema } from "@/schemas/auth/login.schema.js";
import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
} from "@/schemas/auth/password-reset.schema.js";
import { signupSchema } from "@/schemas/auth/signup.schema.js";
import express from "express";

const router = express.Router();

router.get("/validate-session", validateSession);

router.post("/signup", validateData(signupSchema), signup);
router.post("/login", validateData(loginSchema), login);
router.post("/logout", logout);

router.get("/login/google", googleLogin);
router.get("/login/google/callback", googleLoginCallback);

router.post("/reset-password", validateData(resetPasswordRequestSchema), resetPassword);
router.post("/reset-password/:token", validateData(resetPasswordSchema), verifyPasswordResetToken);

export default router;
