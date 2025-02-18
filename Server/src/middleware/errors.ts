import { Request, Response, NextFunction } from "express";
import { ErrorRequestHandler } from "express";
import ErrorHandler from "@Utils/errorHandler";
import { createResponse } from "@Utils/function";

// Error handling middleware
const errorMiddleware: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  // Set default statusCode and message if not provided
  err.statusCode = err?.statusCode || 500;
  err.message = err?.message || "Internal Server Error";

  // Set a default errorCode based on status code
  let errorCode = 'ERR_INTERNAL_SERVER'; // Default error code

  // Handle CastError (Invalid MongoDB ID)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
    errorCode = 'ERR_INVALID_ID'; // Error code for invalid ID
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate value entered for ${Object.keys(err.keyValue)[0]}`;
    err = new ErrorHandler(message, 400);
    errorCode = 'ERR_DUPLICATE_KEY'; // Error code for duplicate key
  }

  // Handle JSON Web Token errors
  if (err.name === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Please try again.`;
    err = new ErrorHandler(message, 400);
    errorCode = 'ERR_INVALID_JWT'; // Error code for invalid JWT
  }

  // Handle token expiration errors
  if (err.name === "TokenExpiredError") {
    const message = `JSON Web Token has expired. Please log in again.`;
    err = new ErrorHandler(message, 401);
    errorCode = 'ERR_JWT_EXPIRED'; // Error code for expired JWT
  }

  // Add more error types and corresponding error codes as needed
  // Example:
  if (err.name === "ValidationError") {
    errorCode = 'ERR_VALIDATION_FAILED';
  }

  // Send error response
  res.status(err.statusCode).json(
    createResponse({
      statusCode: err.statusCode,
      success: false,
      errorCode: errorCode,
      message: err.message,
      data: process.env.APP_MODE === "development" ? err.stack : undefined,
    })
  );
};

export default errorMiddleware;
