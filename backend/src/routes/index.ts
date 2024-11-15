import express from "express";
import v1Route from "./v1/index.js";
const router = express.Router();

router.use("/api/v1", v1Route);

export default router;
