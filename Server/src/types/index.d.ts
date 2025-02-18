import { User } from '@Entity/User';  // Adjust path based on your project structure

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
            requestId?: string;  // Optional: If using requestId in logs
        }
    }
}

interface UserPayload {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    email: string;
}

