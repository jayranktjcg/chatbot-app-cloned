import { Router } from "express";
import { create, list, remove, update, moveFiles, fileDetails } from "./directory.controller";
import { isAuthenticatedUser } from "@Middleware/auth";
import validateRequest from "@Middleware/validateRequest";
import { createDirectorySchema, updateDirectorySchema, moveFileSchema } from "@Validator/directory.validator";

const router = Router();

// Routes with Validation
router.get("/list", isAuthenticatedUser, list);
router.get("/fileDetails/:id", isAuthenticatedUser, fileDetails);
router.post("/create", isAuthenticatedUser, validateRequest(createDirectorySchema), create);
router.put("/update/:id", isAuthenticatedUser, validateRequest(updateDirectorySchema), update);
router.patch("/move/:id", isAuthenticatedUser, validateRequest(moveFileSchema), moveFiles);
router.delete("/remove/:id", isAuthenticatedUser, remove);

export default router;
