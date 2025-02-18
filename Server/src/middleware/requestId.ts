import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Middleware to attach Request ID
const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use the provided ID or generate a new one
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('X-Request-Id', req.requestId); // Send it back in response headers
  next();
};

export default requestIdMiddleware;
