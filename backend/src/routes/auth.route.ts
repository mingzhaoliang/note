import { googleLogin, googleLoginCallback } from "@/controllers/auth/auth-google.controller.js";
import {
  checkIdentifierController,
  deactivateUserController,
  deleteUserController,
  login,
  logout,
  reactivateUserController,
  signup,
  updatePasswordAvailabilityCheck,
  updatePasswordController,
  updateUsernameController,
  validateSession,
} from "@/controllers/auth/auth.controller.js";
import {
  createPasswordResetSessionController,
  resetPasswordController,
  validatePasswordResetSessionTokenController,
  verifyPasswordResetSessionEmailController,
} from "@/controllers/auth/password-reset.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { loginSchema } from "@/schemas/auth/login.schema.js";
import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/schemas/auth/password-reset.schema.js";
import { signupSchema } from "@/schemas/auth/signup.schema.js";
import { updatePasswordSchema } from "@/schemas/auth/update-password.schema.js";
import { updateUsernameSchema } from "@/schemas/auth/update-username.schema.js";
import express from "express";

const router = express.Router();

router.get("/validate-session", validateSession);

router.post("/signup", validateData(signupSchema), signup);

router.post("/login", validateData(loginSchema), login);

router.post("/logout", logout);

router.get("/login/google", googleLogin);

router.get("/login/google/callback", googleLoginCallback);

router.get("/check-identifier", checkIdentifierController);

router.get("/:id/update-password", updatePasswordAvailabilityCheck);

router.post(
  "/forgot-password",
  validateData(resetPasswordRequestSchema),
  createPasswordResetSessionController
);

router.get("/reset-password/validate-session", validatePasswordResetSessionTokenController);

router.put(
  "/reset-password/:token/verify-email",
  validateData(verifyEmailSchema),
  verifyPasswordResetSessionEmailController
);

router.put("/reset-password/:token", validateData(resetPasswordSchema), resetPasswordController);

router.put("/:id/update-username", validateData(updateUsernameSchema), updateUsernameController);

router.put("/:id/update-password", validateData(updatePasswordSchema), updatePasswordController);

router.put("/:id/deactivate", deactivateUserController);

router.put("/:id/delete", deleteUserController);

router.put("/:id/reactivate", reactivateUserController);

export default router;
