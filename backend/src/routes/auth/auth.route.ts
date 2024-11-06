import { googleLogin, googleLoginCallback } from "@/controllers/auth/auth-google.controller.js";
import {
  reactivateUserController,
  deactivateUserController,
  deleteUserController,
  login,
  logout,
  resetPassword,
  signup,
  updatePasswordAvailabilityCheck,
  updatePasswordController,
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
import { updatePasswordSchema } from "@/schemas/auth/update-password.schema.js";
import express from "express";

const router = express.Router();

router.get("/validate-session", validateSession);

router.post("/signup", validateData(signupSchema), signup);

router.post("/login", validateData(loginSchema), login);

router.post("/logout", logout);

router.get("/login/google", googleLogin);

router.get("/login/google/callback", googleLoginCallback);

router.get("/:id/update-password", updatePasswordAvailabilityCheck);

router.post("/reset-password", validateData(resetPasswordRequestSchema), resetPassword);

router.post("/reset-password/:token", validateData(resetPasswordSchema), verifyPasswordResetToken);

router.put("/:id/update-password", validateData(updatePasswordSchema), updatePasswordController);

router.put("/:id/deactivate", deactivateUserController);

router.put("/:id/delete", deleteUserController);

router.put("/:id/reactivate", reactivateUserController);

export default router;
