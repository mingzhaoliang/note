import { signup } from "@/controllers/auth/auth.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { signupSchema } from "@/schemas/auth/signup.schema.js";
import express from "express";

const router = express.Router();

router.post("/signup", validateData(signupSchema), signup);

export default router;
