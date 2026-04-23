/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to host your server on Colyseus Cloud
 *
 * If you're self-hosting (without Colyseus Cloud), you can manually
 * instantiate a Colyseus Server as documented here:
 *
 * See: https://docs.colyseus.io/server/api/#constructor-options
 */
import { listen } from "@colyseus/tools";
import _ from "lodash";
import logger from "./utils/logger.js";
import { appConfig } from "./config/environment.js";

// Import Colyseus config
import app from "./app.config.js";


// Environment validation and port configuration
const DEFAULT_PORT = 2567;
const PORT = appConfig.port || DEFAULT_PORT;
const PM2_ID = !_.isNil(process.env.NODE_APP_INSTANCE)
    ? Number(process.env.NODE_APP_INSTANCE)
    : 0;

// Validate port number
if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
    console.error(
        `Invalid PORT value: ${appConfig.port}. Using default port ${DEFAULT_PORT}`,
    );
}

// Calculate final port with PM2 instance offset
const finalPort = PM2_ID > 0 ? PORT + PM2_ID : PORT;

logger.info(
    `Starting server on port ${finalPort}${PM2_ID > 0 ? ` (PM2 instance ${PM2_ID})` : ""}`,
);

// Create and listen on the calculated port
listen(app, finalPort);
