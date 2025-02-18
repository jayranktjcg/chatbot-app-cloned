import { catchAsyncErrors } from "@Middleware/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { createDirectory, deleteDirectory, getFileDetails, listDirectory, moveFile, updateDirectory } from "./directory.service";
import { sendSuccess, sendError } from "@Utils/response.handler";
import logger from "@Utils/winston.logger";
import { STATUS_CODES } from "@Constant/constant";

// Create Directory or File
export const create = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const result = await createDirectory(req.body, userId);

        logger.info("Directory/File created successfully", { module: "DirectoryModule", userId,result });
        return sendSuccess(res, "Directory/File created successfully.", result, 201);
    } catch (error: any) {
        logger.error("Error creating directory/file", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

// Update Directory or File
export const update = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await updateDirectory(id, req.body);

        logger.info("Directory/File updated successfully", { module: "DirectoryModule", id, result });
        return sendSuccess(res, "Directory/File updated successfully.", result);
    } catch (error: any) {
        logger.error("Error updating directory/file", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

// Delete Directory or File
export const remove = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await deleteDirectory(id);

        logger.info("Directory/File deleted successfully", { module: "DirectoryModule", id, result });
        return sendSuccess(res, `${result.type === "directory" ? "Directory" : "File"} deleted successfully.`, []);
    } catch (error: any) {
        logger.error("Error deleting directory/file", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

// List Directories and Files
export const list = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { parent_id = 0, page = 1, limit = 10 } = req.query;

        const result = await listDirectory(Number(parent_id), userId, Number(page), Number(limit));

        logger.info("Listed directories/files successfully", { module: "DirectoryModule", userId, result });

        return sendSuccess(res, "Directories and files fetched successfully.", result);
    } catch (error: any) {
        logger.error("Error listing directories/files", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

// Move File to Another Directory
export const moveFiles = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await moveFile(id, req.body);

        logger.info("File moved successfully", { module: "DirectoryModule", id, result });
        return sendSuccess(res, "File moved successfully.", result);
    } catch (error: any) {
        logger.error("Error moving file", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

// Get File Details
export const fileDetails = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await getFileDetails(id);

        logger.info("File details fetched successfully", { module: "DirectoryModule", id, result });
        return sendSuccess(res, "File details fetched successfully.", result);
    } catch (error: any) {
        logger.error("Error fetching file details", { module: "DirectoryModule", error: error.message });
        return sendError(res, { status: STATUS_CODES.BAD_REQUEST, error: "Bad Request", message: error.message, path: req.originalUrl });
    }
});

