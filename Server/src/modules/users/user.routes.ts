import { Router } from "express";
import { createUser } from "./users.controller";
import { googleUserSchema } from "@Validator/user.validator";
import validateRequest from "@Middleware/validateRequest";
const router = Router();

// API Routes
router.post("/create", validateRequest(googleUserSchema), createUser);

router.get("/testing", (req, res)=>{
    res.status(200).json({
        success: false,
        message: "Internal server error.",
    });
});

export default router;
