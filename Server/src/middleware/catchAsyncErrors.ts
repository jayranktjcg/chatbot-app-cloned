import { STATUS_CODES } from '@Constant/constant';
import { sendError } from '@Utils/response.handler';
import { Request, Response, NextFunction } from 'express';

export const catchAsyncErrors = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(`[Async Error] ${error.message}`, {
                stack: error.stack,
                path: req.originalUrl
            });
            next(error);
        });
    };
};


export const multerErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err.name === "MulterError") {
        // Handle Multer-specific errors
        sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: err.message,
            path: req.originalUrl,
        });
    }

    if (err) {
        // Handle other errors
        sendError(res, {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            error: "An unexpected error occurred.",
            message: err.message,
            path: req.originalUrl,
        });
    }

    next(); // Proceed if no error
};