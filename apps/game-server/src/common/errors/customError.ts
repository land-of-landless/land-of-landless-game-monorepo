interface ErrorOptions {
    code: number;
    status: string;
    error_obj?: any;
    httpCode?: number;
}

export class CustomError extends Error {
    public readonly code: number;
    public readonly status: string;
    public readonly error_obj?: any;
    public readonly httpCode: number;

    constructor(message: string, options: ErrorOptions) {
        super(message);
        this.code = options.code;
        this.status = options.status;
        this.error_obj = options.error_obj;
        this.httpCode = options.httpCode || 400;

        // Set the prototype explicitly for proper instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            code: this.code,
            status: this.status,
            message: this.message,
            ...(this.error_obj && { error_obj: this.error_obj }),
        };
    }
}

export const createError = (message: string, options: ErrorOptions) => {
    return new CustomError(message, options);
};
