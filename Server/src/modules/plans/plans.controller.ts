import { Request, Response } from "express";
import { createPlan } from "./plans.service";
import { sendSuccess, sendError } from "@Utils/response.handler";
import { STATUS_CODES } from "@Constant/constant";
import { catchAsyncErrors } from "@Middleware/catchAsyncErrors";

export const createPlanController = catchAsyncErrors(async (req: Request, res: Response) => {
	const { name, duration, price } = req.body;

	try {
		const plan = await createPlan(name, duration, price);
		return sendSuccess(res, "Plan created successfully", plan, STATUS_CODES.CREATED);
	} catch (error: any) {
		return sendError(res, {
			status: STATUS_CODES.INTERNAL_SERVER_ERROR,
			error: "PlanCreationError",
			message: error.message,
			details: error.stack,
			path: req.originalUrl,
		});
	}
});
