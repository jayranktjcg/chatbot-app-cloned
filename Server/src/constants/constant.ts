import path from "path"

export const STATUS_CODES = {
    // Successful Responses
    SUCCESS: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Redirection Messages
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // Client Error Responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_MANY_REQUESTS: 429,

    // Server Error Responses
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};

export const MESSAGES = {    
    UNAUTHORIZED: "Unauthorized access. Please log in.",
}



export const constants = {
    CHAR_SET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    FILE_EXTS: [".png", ".jpg", ".jpeg", ".gif", ".mp3", ".mp4", ".pdf", ".txt", ".doc", ".avi", ".mov", ".mkv", ".webm", ".docx", ".ttf", ".webp", ".csv", '.mpeg'],
    ALLOWED_MIME_TYPE: [
        "audio/mpeg",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/flac",
        "audio/aac",
        "audio/x-aac",
        "audio/ogg",
        "audio/x-ogg",
        "audio/webm",
        "audio/mp4",
        "audio/m4a",
        // Text-based files
        "text/plain",
        "text/csv",
        "application/json",
        "application/pdf",
        // Image files
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/tiff",
        // Video files (if used for specific models)
        "video/mp4",
        "video/webm",
        // Archive/compressed formats
        "application/zip",
        "application/x-tar"
    ],
    UPLOAD_DIR: path.join(__dirname, '../../uploads'), // Base upload directory
}

