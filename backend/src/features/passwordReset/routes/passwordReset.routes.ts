import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/features/passwordReset/validation/passwordReset.validation.js";
import { validateData } from "@/middleware/validation.js";
import express from "express";
import * as passwordResetController from "../controllers/passwordReset.controller.js";

const router = express.Router();

router.post(
  "/forgot-password",
  validateData(resetPasswordRequestSchema),
  passwordResetController.createPasswordResetSession
);
router.get("/validate-session", passwordResetController.validatePasswordResetSessionToken);

router.put(
  "/:token/verify-email",
  validateData(verifyEmailSchema),
  passwordResetController.verifyPasswordResetSessionEmail
);

router.put("/:token", validateData(resetPasswordSchema), passwordResetController.resetPassword);

export default router;
