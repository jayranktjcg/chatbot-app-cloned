import User from '@Entity/User';
import { AppDataSource } from '@Config/connection';
import jwt from 'jsonwebtoken';
import { commonFunctions } from '@Utils/common.functions';

const userRepository = AppDataSource.getRepository(User);

/**
 * Finds a user by email.
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await userRepository.findOne({ where: { email } });
};

/**
 * Creates a new user.
 */
export const saveUser = async (reqData: CreateUserRequest): Promise<User> => {
    const { first_name, last_name } = commonFunctions.extractFirstName(reqData);
    const newUser = userRepository.create({
        email: reqData.email,
        first_name,
        last_name,
        profile_picture: reqData.profile_picture,
    });
    return await userRepository.save(newUser);
};

/**
 * Generates JWT token for the user.
 */
export const generateAuthToken = (user: User): string => {
    return jwt.sign(
        { ...user },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};
