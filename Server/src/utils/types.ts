export interface ApiResponse<T = any> {
    statusCode: number;
    success: boolean;
    error_code?: string | null;
    message?: string;
    data?: T;
    record_count?: number | null;
}