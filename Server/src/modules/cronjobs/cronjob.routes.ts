import { Router } from "express";
import { generateSummary } from "./cronjob.controller";

const router = Router();

// API Routes
router.get("/generateSummary", generateSummary);

export default router;
