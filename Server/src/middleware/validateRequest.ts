import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '@Utils/response.handler';
import logger from '@Utils/winston.logger';
import { STATUS_CODES } from '@Constant/constant';

const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const details = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            logger.error("Getting Error", {
                status: STATUS_CODES.BAD_REQUEST,
                error: 'Validation Error',
                message: 'Invalid input data',
                details,
                path: req.originalUrl
            });

            sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: 'Validation Error',
                message: 'Invalid input data',
                details,
                path: req.originalUrl
            });
            return;
        }

        next();
    };
};

export default validateRequest;
