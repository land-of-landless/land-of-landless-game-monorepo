import { RATE_LIMITS_CONFIG } from "@/constants";

interface ErrorOptions {
    code?: number;
    status?: string;
    error_obj?: any;
    httpCode?: number;
    isOperational?: boolean;
}

export class AppError extends Error {
    public readonly code: number;
    public readonly status: string;
    public readonly error_obj?: any;
    public readonly httpCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, options: ErrorOptions = {}) {
        super(message);
        this.code = options.code || 500;
        this.status = options.status || "error";
        this.error_obj = options.error_obj;
        this.httpCode = options.httpCode || 500;
        this.isOperational = options.isOperational !== false; // Default to true

        // For proper stack traces
        Error.captureStackTrace(this, this.constructor);
    }
}

// Simple wrapper function to create errors
const createError = (
    message: string,
    code: number = 500,
    status: string = "error",
    httpCode: number = 500,
) => {
    return new AppError(message, { code, status, httpCode });
};

export const ERRORS = {
    // General errors (9000-9099)
    UNKNOWN: (message: string = "Unknown error") =>
        createError(message, 9000, "unknown_error", 500),

    // Validation errors (9100-9199)
    VALIDATION: (message: string = "Validation failed") =>
        createError(message, 9100, "validation_error", 400),

    // Auth errors (9200-9299)
    UNAUTHORIZED: (message: string = "Unauthorized") =>
        createError(message, 9200, "unauthorized", 401),
    FORBIDDEN: (message: string = "Forbidden") =>
        createError(message, 9201, "forbidden", 403),

    // Resource errors (9300-9399)
    NOT_FOUND: (message: string = "Resource not found") =>
        createError(message, 9300, "not_found", 404),

    // Rate limiting (9400-9499)
    RATE_LIMIT: (message: string = "Too many requests") =>
        createError(message, 9400, "rate_limit_exceeded", 429),

    // Database errors (9500-9599)
    DB_ERROR: (message: string = "Database error") =>
        createError(message, 9500, "database_error", 500),

    // External service errors (9600-9699)
    EXTERNAL_SERVICE: (message: string = "External service error") =>
        createError(message, 9600, "external_service_error", 502),
};

// For backward compatibility
export const UNKNOWN_ERROR = (error: any) => {
    return new AppError(error?.message || "Unknown error", {
        code: 9000,
        status: "unknown_error",
        error_obj: error,
        httpCode: 400,
    });
};
