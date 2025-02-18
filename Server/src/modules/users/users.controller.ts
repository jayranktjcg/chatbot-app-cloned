import { Request, Response } from 'express';
import { catchAsyncErrors } from '@Middleware/catchAsyncErrors';
import { findUserByEmail, generateAuthToken, saveUser } from './users.service';
import { sendSuccess, sendError } from '@Utils/response.handler';
import logger from '@Utils/winston.logger';
import { STATUS_CODES } from '@Constant/constant';


/**
 * Handles user registration and login.
 */
export const createUser = catchAsyncErrors(async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
    const { email, name, profile_picture } = req.body;

    try {
        logger.info('Creating User - Request Received', {
            module: 'UserModule',
            requestId: req.requestId || 'N/A',
            header: req.headers.authorization || "",
            request: req.body
        });

        // Check if the user already exists
        let user = await findUserByEmail(email);
        logger.info('Find Existing User', {
            module: 'UserModule',
            requestId: req.requestId || 'N/A',
            header: req.headers.authorization || "",
            user
        });

        if (user) {
            // Existing user: generate and return token
            const token = generateAuthToken(user);
            logger.info('Generate Auth Token For Existing User', {
                module: 'UserModule',
                requestId: req.requestId || 'N/A',
                header: req.headers.authorization || "",
                token
            });

            return sendSuccess(res, "User has been signed in successfully.", { user, token }, 200);
        }

        // Create a new user
        const newUser = await saveUser({ email, name, profile_picture });
        logger.info('Save User', {
            module: 'UserModule',
            requestId: req.requestId || 'N/A',
            header: req.headers.authorization || "",
            user: newUser
        });

        // Generate Authentication token for the new user
        const token = generateAuthToken(newUser);
        logger.info('Generate Auth Token For New User', {
            module: 'UserModule',
            requestId: req.requestId || 'N/A',
            header: req.headers.authorization || "",
            token
        });
        
        return sendSuccess(res, "User has been signed up successfully.", { user: newUser, token }, 201);
    } catch (error: any) {
        logger.error('Error Occurred While Creating User', {
            module: 'UserModule',
            requestId: req.requestId || 'N/A',
            header: req.headers.authorization || "",
            message: error.message,
            stack: error.stack,
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Internal server error. Please try again later.",
            path: req.originalUrl
        });
    }
});