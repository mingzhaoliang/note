import * as authController from "@/features/auth/controllers/auth.controller.js";
import {
  loginSchema,
  signupSchema,
  updatePasswordSchema,
  updateUsernameSchema,
} from "@/features/auth/validation/auth.validation.js";
import { validateData } from "@/middleware/validation.js";
import express from "express";

const router = express.Router();

router.get("/validate-session", authController.validateSession);
router.post("/signup", validateData(signupSchema), authController.signup);
router.post("/login", validateData(loginSchema), authController.login);
router.post("/logout", authController.logout);

router.get("/login/google", authController.googleLoginRedirect);
router.get("/login/google/callback", authController.googleLoginCallback);

router.get("/is-unique-username", authController.checkUniqueUsername);

router.get("/:id/has-password", authController.checkHasPassword);
router.put(
  "/:id/update-username",
  validateData(updateUsernameSchema),
  authController.updateUsername
);
router.put(
  "/:id/update-password",
  validateData(updatePasswordSchema),
  authController.updatePassword
);

router.put("/:id/deactivate", authController.deactivateUser);
router.put("/:id/delete", authController.deleteUser);
router.put("/:id/reactivate", authController.reactivateUser);

export default router;
