import { constants } from '@Constant/constant';
import { ApiResponse } from './types';

export const createResponse = <T = any>({ statusCode, success, errorCode = null, message = '', data, record_count }: {
    statusCode: number;
    success: boolean;
    errorCode?: string | null;
    message?: string;
    data?: T;
    record_count?: number;
}): ApiResponse<T> => ({
    statusCode, success, error_code: errorCode, message, data, record_count
});

export const randomString = async (strLength: number = 5): Promise<string> => {
    let result = '';
    const charSet = constants.CHAR_SET;

    while (strLength > 0) {
        result += charSet.charAt(Math.floor(Math.random() * charSet.length));
        strLength--;
    }

    return result;
};