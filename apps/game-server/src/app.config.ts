/**
 * Main application configuration file for the Colyseus server.
 * This file sets up the Express application, configures middleware,
 * defines API routes, and initializes the Colyseus GameServer with
 * its rooms and lifecycle hooks. It's the central point for bootstrapping the server.
 */


import config from "@colyseus/tools";
import { defineServer } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from "express";

// Environment configuration and validation
import {
    appConfig,
    validateEnvironment,
    isTest,
    isDevelopment,
} from "@/config/environment.js";

import logger, { paymentLogger } from "@/utils/logger.js";

// --- Express Middlewares ---
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import globalRateLimiterMiddleWare from "@/middlewares/globalRateLimiter.js";
import { errorHandler, notFoundHandler } from "@/middlewares/errorHandler.js";

// Auth module
import { auth } from "@colyseus/auth";
import "./config/auth.js";

/**
 *
 * Import your Room files
 */
import { MyRoom } from "@/rooms/MyRoom.js";
import { RedisPresence } from "colyseus";
import { RedisDriver } from "@colyseus/redis-driver";
import {
    connectFastRedisInstance,
} from "@/daos/redis/connectRedis/index.js";

// --- API and Service Imports ---
import v1Router from "@/api/v1/routes/index.js";
import _ from "lodash";
import basicAuthMiddleware from "@/middlewares/basicPassAuth.js";
import { clientIpMiddleware } from "@/middlewares/clientIpExtractor.js";
import { convertMsToStringTime } from "./utils/time.js";
import { AppError, ERRORS } from "./common/errors/appError.js";

// math add function

export default defineServer({
    rooms: {},
    // Server-level options.
    devMode: appConfig.nodeEnv === "development",

    // public address
    // publicAddress: process.env.PUBLIC_ADDRESS,

    // driver: new RedisDriver({
    //     presence: new RedisPresence({}),
    // }),

    gracefullyShutdown: true,

    express: app => {
        // This function configures the Express application with middleware and routes.
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */

        app.use(express.json({}));

        app.use(express.urlencoded({ extended: true }));

        // Middleware to get the client's IP address, even behind a proxy.
        app.use(clientIpMiddleware);

        // Register Colyseus authentication routes (e.g., /auth/google).
        app.use(auth.prefix, auth.routes());

        // Apply a global rate limiter to all requests.
        app.use(globalRateLimiterMiddleWare);

        // Compress all HTTP responses to reduce traffic size.
        app.use(compression());

        if (!isTest()) {
            // placeholder for future use
        }
        // Log incoming HTTP requests for debugging.
        app.use(morgan("combined"));
        // Apply security-related HTTP headers.
        app.use(helmet());
        // Configure Cross-Origin Resource Sharing (CORS).
        app.use(
            cors({
                // Allow all origins in development, but restrict to a specific origin in production.
                origin: appConfig.cors.origin,
                methods: ["GET", "POST"],
            })
        );

        // --- Custom Application Routes ---
        //
        //
        // general routes
        //
        //

        // Register the version 1 API routes under the `/api/v1` prefix.
        app.use("/api/v1", v1Router);

        // ip checker - for gathering anonymous user identity for bot farm detection
        // app.use(ipChecker);
        // !important: not practical because there are cellular networks that share the same IP address

        // --- Development-Only Routes and Middleware ---
        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        // Use Morgan for HTTP request logging in development mode
        if (appConfig.nodeEnv === "development") {
            app.use(morgan("dev"));
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", basicAuthMiddleware, monitor());

        // Register playground
        app.use("/playground", basicAuthMiddleware, playground());

        // Register 404 handler (must be after all routes)
        app.use(notFoundHandler);

        // Error handling middleware (must be after all other middleware and routes)
        app.use(
            (
                err: unknown,
                req: express.Request,
                res: express.Response,
                _next: express.NextFunction
            ) => {
                if (err instanceof Error) {
                    errorHandler(err, req, res, _next);
                } else if (err instanceof AppError) {
                    errorHandler(err, req, res, _next);
                } else {
                    // For non-Error objects, convert to Error
                    const error = new Error("An unknown error occurred");
                    errorHandler(error, req, res, _next);
                }
            }
        );

        // TODO: later on throttle this conditionally! only for certain cases (hint: cf)
        // handy when there are load balancers to consider
        app.set("trust proxy", true);
    },

    beforeListen: async () => {
        // This hook runs once, before the server starts listening for connections.
        // It's the ideal place for asynchronous setup tasks like database connections and indexing.
        try {
            /**
             * Before before gameServer.listen() is called.
             */

            // Validate environment variables on startup
            validateEnvironment();
            logger.info("Environment validation passed");

            // Establish the connection to Redis (rate limiting, profanity cache).
            await connectFastRedisInstance();
        } catch (error) {
            logger.error("error", {
                error: error instanceof Error ? error.message : error,
            });
        }
    },
});
