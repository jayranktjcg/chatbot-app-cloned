import { NextFunction, Request, Response } from "express";
import { startTrial } from "./subscriptions.service";
import { sendError, sendSuccess } from "@Utils/response.handler";
import { STATUS_CODES } from "@Constant/constant";
import { catchAsyncErrors } from "@Middleware/catchAsyncErrors";

export const startTrialController = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, planId, paymentMethodId } = req.body;

    try {
        const subscription = await startTrial(userId, planId, paymentMethodId);
        return sendSuccess(res, "Trial started successfully", subscription, STATUS_CODES.CREATED);
    } catch (error: any) {
        return sendError(res, {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            error: "TrialStartError",
            message: error.message,
            details: error.stack,
            path: req.originalUrl,
        });
    }
});
