import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "@Config/connection";
import User from "@Entity/User";
import ErrorHandler from "@Utils/errorHandler";
import { MESSAGES, STATUS_CODES } from "@Constant/constant";
import { ENV } from "@Config/env";
import { catchAsyncErrors } from "./catchAsyncErrors";


export const isAuthenticatedUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorHandler("Authorization token is missing.", STATUS_CODES.UNAUTHORIZED));
    }

    const token = authHeader.split(" ")[1];
    
    try {
        // Verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET!) as { id: number };

        // Fetch user from database
        const user = await AppDataSource.getRepository(User).findOneBy({ id: decoded.id });

        if (!user) {
            return next(new ErrorHandler("User not found. Please log in again.", STATUS_CODES.UNAUTHORIZED));
        }

        // Attach user to the request
        req.user = user;

        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid or expired token. Please log in again.", STATUS_CODES.UNAUTHORIZED));
    }
});
