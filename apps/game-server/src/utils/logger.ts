/**
 * Centralized logging system using Winston
 * Provides structured logging with different levels and transports
 * Replaces console.log throughout the application
 */

import winston from "winston";
import { appConfig, isDevelopment, isProduction } from "@/config/environment";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output in development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
        return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
    }),
);

// JSON format for file output and production
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

// Create the main logger instance
export const logger = winston.createLogger({
    level: appConfig.logging.level,
    defaultMeta: {
        service: "lol-game-server",
        environment: appConfig.nodeEnv,
        version: process.env.npm_package_version || "1.0.0",
    },
    transports: [
        // Error log file - only errors
        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Combined log file - all levels
        new winston.transports.File({
            filename: path.join(logsDir, "combined.log"),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        new winston.transports.Console({
            format: consoleFormat,
        }),

        // // Console output
        // ...(isDevelopment()
        //     ? [
        //           new winston.transports.Console({
        //               format: consoleFormat,
        //           }),
        //       ]
        //     : []),

        // // In production, add console with JSON format for log aggregation
        // ...(isProduction()
        //     ? [
        //           new winston.transports.Console({
        //               format: fileFormat,
        //           }),
        //       ]
        //     : []),
    ],

    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "exceptions.log"),
            format: fileFormat,
        }),
    ],

    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "rejections.log"),
            format: fileFormat,
        }),
    ],
});

// Specialized loggers for different components
export const gameLogger = logger.child({ component: "game" });
export const apiLogger = logger.child({ component: "api" });
export const dbLogger = logger.child({ component: "database" });
export const paymentLogger = logger.child({ component: "payment" });
export const authLogger = logger.child({ component: "auth" });

/**
 * Log API requests with structured data
 */
export const logApiRequest = (req: any, res: any, responseTime?: number) => {
    const logData = {
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent"),
        ip: req.clientIp || req.ip,
        userId: req.auth?.userId,
        statusCode: res.statusCode,
        responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    if (res.statusCode >= 400) {
        apiLogger.warn("API request completed with error", logData);
    } else {
        apiLogger.info("API request completed", logData);
    }
};

/**
 * Log database operations
 */
export const logDbOperation = (
    operation: string,
    collection: string,
    duration?: number,
    error?: Error,
) => {
    const logData = {
        operation,
        collection,
        duration: duration ? `${duration}ms` : undefined,
        error: error?.message,
    };

    if (error) {
        dbLogger.error("Database operation failed", logData);
    } else {
        dbLogger.debug("Database operation completed", logData);
    }
};

/**
 * Log payment operations with sensitive data filtering
 */
export const logPaymentOperation = (
    operation: string,
    data: any,
    error?: Error,
) => {
    // Filter sensitive data
    const sanitizedData = {
        ...data,
        // Remove sensitive fields
        apiKey: undefined,
        webhookSecret: undefined,
        chargeId: data.chargeId ? `***${data.chargeId.slice(-4)}` : undefined,
    };

    const logData = {
        operation,
        data: sanitizedData,
        error: error?.message,
    };

    if (error) {
        paymentLogger.error("Payment operation failed", logData);
    } else {
        paymentLogger.info("Payment operation completed", logData);
    }
};

/**
 * Log game events
 */
export const logGameEvent = (
    event: string,
    roomId: string,
    userId?: string,
    data?: any,
) => {
    gameLogger.info("Game event", {
        event,
        roomId,
        userId,
        data,
    });
};

/**
 * Log authentication events
 */
export const logAuthEvent = (
    event: string,
    userId?: string,
    ip?: string,
    error?: Error,
) => {
    const logData = {
        event,
        userId,
        ip,
        error: error?.message,
    };

    if (error) {
        authLogger.warn("Authentication event with error", logData);
    } else {
        authLogger.info("Authentication event", logData);
    }
};

/**
 * Performance monitoring helper
 */
export class PerformanceTimer {
    private startTime: number;
    private operation: string;
    private logger: winston.Logger;

    constructor(operation: string, customLogger?: winston.Logger) {
        this.startTime = Date.now();
        this.operation = operation;
        this.logger = customLogger || logger;
    }

    end(additionalData?: any): number {
        const duration = Date.now() - this.startTime;

        this.logger.debug("Operation completed", {
            operation: this.operation,
            duration: `${duration}ms`,
            ...additionalData,
        });

        return duration;
    }
}

/**
 * Graceful shutdown logging
 */
export const setupGracefulShutdown = () => {
    const shutdown = (signal: string) => {
        logger.info("Received shutdown signal", { signal });

        // Close logger transports
        logger.end(() => {
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};

// Export the main logger as default
export default logger;
