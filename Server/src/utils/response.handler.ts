import { STATUS_CODES } from '@Constant/constant';
import { Response } from 'express';

interface ErrorResponse {
    status: number;
    error: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
    path?: string;
}

interface SuccessResponse<T> {
    status: number;
    message: string;
    data: T;
}

export const sendSuccess = <T>(res: Response, message: string, data: T, status = STATUS_CODES.SUCCESS): Response => {
    return res.status(status).json({
        status,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

export const sendError = (res: Response, errorResponse: ErrorResponse): Response => {
    const { status, error, message, details, path } = errorResponse;

    return res.status(status).json({
        status,
        error,
        message,
        details,
        timestamp: new Date().toISOString(),
        path
    });
};
