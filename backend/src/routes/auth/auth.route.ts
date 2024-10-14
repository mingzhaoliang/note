import { googleLogin, googleLoginCallback } from "@/controllers/auth/auth-google.controller.js";
import { login, signup } from "@/controllers/auth/auth.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { loginSchema } from "@/schemas/auth/login.schema.js";
import { signupSchema } from "@/schemas/auth/signup.schema.js";
import express from "express";

const router = express.Router();

router.post("/signup", validateData(signupSchema), signup);
router.post("/login", validateData(loginSchema), login);

router.get("/login/google", googleLogin);
router.get("/login/google/callback", googleLoginCallback);

export default router;
