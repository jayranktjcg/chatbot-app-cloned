import { catchAsyncErrors } from "@Middleware/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import { processChatSummaries } from "./cronjob.service";
import { sendSuccess, sendError } from "@Utils/response.handler";
import logger from "@Utils/winston.logger";
import { STATUS_CODES } from "@Constant/constant";

/**
 * Controller to trigger chat summary generation
 */
export const generateSummary = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info("Triggering chat summary generation", { module: "CronJobModule" });

        await processChatSummaries();

        return sendSuccess(res, "Chat summaries generated successfully.", null, 200);
    } catch (error: any) {
        logger.error("Error generating chat summaries", {
            module: "CronJobModule",
            message: error.message,
            stack: error.stack
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Failed to generate chat summaries.",
            path: req.originalUrl
        });
    }
});
