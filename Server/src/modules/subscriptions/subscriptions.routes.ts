import { Router } from "express";
import { startTrialController } from "./subscriptions.controller";
const router = Router();

router.post("/subscriptions/trial", startTrialController);

export default router;
