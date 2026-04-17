import { ColyseusTestServer, boot } from "@colyseus/testing";
import appConfig from "../src/app.config";
import { authCallback } from "../src/config/auth";
import { sign } from "jsonwebtoken";
import { flushAllRedisDB } from "../src/daos/redis/connectRedis";
import { createRedisIndexes } from "../src/daos/redis/repositories/index";

// Store the server instance
export let server: ColyseusTestServer | null = null;

// Store active connections
let activeConnections = 0;

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DISABLE_OAUTH = "true";

export let globalUsersJwtTokens: string[] = [];
export let testUserId: string;

// Simple test configuration
export const testConfig = {
    // Add any test-specific configuration here
    // For example, you can disable certain features during tests
    test: true,
};

/**
 * Setup the test server
 */
export async function setup() {
    if (!server) {
        try {
            // always re-initialize data for each test suite
            await flushAllRedisDBHelper();
            await createRedisIndexes();
            // Boot the server with test configuration
            server = await boot(appConfig);
            await initializeDataForTesting();
        } catch (error) {
            console.error("Failed to boot test server:", error);
            throw error;
        }
    }

    activeConnections++;
    return server;
}

/**
 * Teardown the test server
 */
export async function teardown() {
    activeConnections--;

    // Only shutdown if no more active connections
    if (server && activeConnections <= 0) {
        try {
            await server.shutdown();
        } catch (error) {
            console.error("Error during test server shutdown:", error);
        } finally {
            server = null;
        }
    }
}

/**
 * Cleanup after each test
 */
export async function cleanup() {
    if (server) {
        try {
            // await flushAllRedisDB();
            await server.cleanup();
        } catch (error) {
            console.error("Error during test cleanup:", error);
        }
    }
}

export async function createTestUser(data: any, provider: string) {
    try {
        const profile = data.profile;

        let res = await authCallback(data, provider);

        return res;
    } catch (error) {
        console.error(
            `[AuthCallbackError] Failed during authentication with provider: ${provider}.`,
            {
                error,
            },
        );
        throw error;
    }
}

export function turnObjectToJWT(payload: object, secret: string): string {
    if (!secret) {
        throw new Error("A secret key must be provided to sign the JWT.");
    }
    const token = sign(payload, secret);

    return token;
}

export async function initializeDataForTesting() {
    try {
        // check if  process.env.JWT_SECRET is null
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set.");
        }

        //generate user with id 1
        let user1Data = await createTestUser(
            {
                profile: {
                    sub: "1",
                },
            },
            "google",
        );

        let jwtToken = turnObjectToJWT(user1Data, process.env.JWT_SECRET);
        globalUsersJwtTokens[0] = jwtToken;
        testUserId = user1Data.userId;
    } catch (error) {
        console.error("Error during data initialization:", error);
        throw error;
    }
}

export async function flushAllRedisDBHelper() {
    await flushAllRedisDB();
}
