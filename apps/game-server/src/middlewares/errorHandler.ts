import { Request, Response, NextFunction } from "express";
import { AppError, ERRORS } from "../common/errors/appError.ts";
import logger from "../utils/logger.ts";
import { isProduction } from "@/config/environment.js";

import { ApiResponse } from "@/api/v1/utils/response.js";

// Using the ErrorResponse type from response.ts
type ErrorResponse = {
    status: "error";
    code: string;
    message: string;
    details?: unknown;
};

/**
 * Error handling middleware that catches all errors in the application
 * and returns a consistent error response format.
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // Default to 500 Internal Server Error
    let statusCode = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: unknown;

    // Log the error with request context
    const logContext = {
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        user: (req as any).user?._id,
        error: err.message,
        stack: err.stack,
    };

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.httpCode || 500;
        code = err.code.toString(); // Convert number to string to match ErrorResponse type
        message = err.message;
        details = err.error_obj;

        // Log operational errors as warnings, others as errors
        if (err.isOperational) {
            logger.warn("Operational error", logContext);
        } else {
            logger.error("Unexpected error", logContext);
        }
    }
    // Handle validation errors (from express-validator or similar)
    else if (err.name === "ValidationError" || (err as any).errors) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Validation failed";
        details = (err as any).errors || [];

        logger.warn("Validation error", {
            ...logContext,
            validationErrors: details,
        });
    }
    // Handle other error types
    else {
        // In production, don't leak error details
        if (!isProduction()) {
            message = err.message || message;
            details = {
                message: err.message,
                stack: err.stack,
            };
        }

        logger.error("Unexpected error", logContext);
    }

    // Send the error response using ApiResponse.error
    return ApiResponse.error(res, statusCode, code, message, details);
}

/**
 * Wrapper for async/await error handling in Express routes
 */
export function asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 404 Not Found handler
 * Creates a not found error and passes it to the next middleware
 */
export function notFoundHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const error = ERRORS.NOT_FOUND(`Cannot ${req.method} ${req.originalUrl}`);
    next(error);
}
