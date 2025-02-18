import { Router } from "express";
import { createPlanController } from "./plans.controller";
import { createPlanSchema } from "@Validator/plans.validator";
import validateRequest from "@Middleware/validateRequest";

const router = Router();

router.post("/plans", validateRequest(createPlanSchema), createPlanController);

export default router;
