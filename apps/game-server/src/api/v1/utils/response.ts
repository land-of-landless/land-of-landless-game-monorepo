import { Response } from "express";

export type SuccessResponse<T> = {
    status: "success";
    data: T;
    meta?: Record<string, any>;
};

export type ErrorResponse = {
    status: "error";
    code: string;
    message: string;
    details?: unknown;
};

export class ApiResponse {
    static success<T>(
        res: Response,
        data: T,
        meta?: Record<string, any>,
    ): Response {
        const response: SuccessResponse<T> = {
            status: "success",
            data,
        };

        if (meta) {
            response.meta = meta;
        }

        return res.status(200).json(response);
    }

    static created<T>(res: Response, data: T): Response {
        const response: SuccessResponse<T> = {
            status: "success",
            data,
        };

        return res.status(201).json(response);
    }

    static error(
        res: Response,
        statusCode: number,
        code: string,
        message: string,
        details?: unknown,
    ): Response {
        const response: ErrorResponse = {
            status: "error",
            code,
            message,
        };

        if (details) {
            response.details = details;
        }

        return res.status(statusCode).json(response);
    }
}
