# Welcome to Colyseus!

[![CI](https://github.com/land-of-landless/lol-game-colyseus-server/actions/workflows/ci.yml/badge.svg)](https://github.com/land-of-landless/lol-game-colyseus-server/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

```
npm start
```

## Structure

- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `src/rooms/MyRoom.ts`: an empty room handler for you to implement your logic
- `src/rooms/schema/MyRoomState.ts`: an empty schema used on your room's state.
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `package.json`:
    - `scripts`:
        - `npm start`: runs `ts-node-dev index.ts`
        - `npm test`: runs mocha test suite
        - `npm run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.ts` script.
- `tsconfig.json`: TypeScript configuration file

## Environment Variables in `.env.development`

This file contains environment variables used for the development environment of the application. Each variable is described below:

**Authentication and Security:**

- **`AUTH_SALT`**:
    - **Role:** A salt used for hashing passwords or other sensitive data. It adds randomness to the hashing process, making it more secure against rainbow table attacks.
    - **Importance:** High - Critical for security.
- **`JWT_SECRET`**:
    - **Role:** A secret key used to sign JSON Web Tokens (JWTs). JWTs are used for authentication and authorization.
    - **Importance:** High - Critical for security.
- **`SESSION_SECRET`**:
    - **Role:** A secret key used to encrypt session data. Sessions are used to maintain user state across multiple requests.
    - **Importance:** High - Critical for security.

**OAuth 2.0 Credentials:**

- **`DISCORD_CLIENT_ID`**:
    - **Role:** The client ID for the Discord OAuth 2.0 application. Used to identify the application when users authenticate with Discord.
    - **Importance:** Medium - Required for Discord login.
- **`DISCORD_CLIENT_SECRET`**:
    - **Role:** The client secret for the Discord OAuth 2.0 application. Used to authenticate the application with Discord.
    - **Importance:** High - Critical for Discord login.
- **`GOOGLE_CLIENT_ID`**:
    - **Role:** The client ID for the Google OAuth 2.0 application. Used to identify the application when users authenticate with Google.
    - **Importance:** Medium - Required for Google login.
- **`GOOGLE_CLIENT_SECRET`**:
    - **Role:** The client secret for the Google OAuth 2.0 application. Used to authenticate the application with Google.
    - **Importance:** High - Critical for Google login.
- **`X_CLIENT_ID`**:
    - **Role:** The client ID for the X (formerly Twitter) OAuth 2.0 application. Used to identify the application when users authenticate with X.
    - **Importance:** Medium - Required for X login.
- **`X_CLIENT_SECRET`**:
    - **Role:** The client secret for the X (formerly Twitter) OAuth 2.0 application. Used to authenticate the application with X.
    - **Importance:** High - Critical for X login.

**Application Configuration:**

- **`NODE_ENV`**:
    - **Role:** Specifies the current environment. In this case, it's set to `development`. This is used to configure the application differently based on the environment.
    - **Importance:** Medium - Affects application behavior.
- **`CORS_ORIGIN`**:
    - **Role:** Specifies the allowed origin for Cross-Origin Resource Sharing (CORS). In this case, it's set to `http://localhost:2567`, allowing requests from the local development server.
    - **Importance:** Medium - Required for frontend to communicate with the backend.
- **`PORT`**:
    - **Role:** The port on which the application server will listen for incoming requests. Here, it's set to `2567`.
    - **Importance:** Medium - Defines the server's listening port.
- **`PROXY_NUMBER`**:
    - **Role:** likely used to define the number of proxy to use.
    - **Importance:** Low - depends on the application.

**Payment Integration (OxaPay):**

- **`OXAPAY_BASE_URL`**:
    - **Role:** The base URL for the OxaPay API.
    - **Importance:** Medium - Required for OxaPay integration.
- **`OXAPAY_MERCHANT`**:
    - **Role:** The merchant ID for OxaPay.
    - **Importance:** High - Required for OxaPay transactions.
- **`OXAPAY_CALLBACK`**:
    - **Role:** The URL that OxaPay will call back to after a payment is processed.
    - **Importance:** High - Required for OxaPay transaction confirmation.
- **`ALLOWED_IPS_FOR_PAYMENT_CALLBACK`**:
    - **Role:** A comma-separated list of IP addresses that are allowed to make requests to the payment callback endpoint. This is a security measure to prevent unauthorized access.
    - **Importance:** High - Critical for security of payment callbacks.

**Rate Limiting:**

- **`RATE_LIMIT_WINDOW_MS`**:
    - **Role:** The time window (in milliseconds) for rate limiting. Here, it's set to `1000` (1 second).
    - **Importance:** Medium - Affects rate limiting behavior.
- **`RATE_LIMIT_MAX`**:
    - **Role:** The maximum number of requests allowed within the rate limit window. Here, it's set to `10`.
    - **Importance:** Medium - Affects rate limiting behavior.

**Database Connections:**

- **`MONGO_DB_URI`**:
    - **Role:** The connection string for the MongoDB database.
    - **Importance:** High - Critical for database access.
- **`REDIS_DB_PASS`**:
    - **Role:** The password for the Redis database.
    - **Importance:** High - Critical for Redis access.
- **`REDIS_DB_USER`**:
    - **Role:** The username for the Redis database.
    - **Importance:** High - Critical for Redis access.
- **`REDIS_DB_HOST`**:
    - **Role:** The hostname for the Redis database.
    - **Importance:** High - Critical for Redis access.
- **`REDIS_DB_PORT`**:
    - **Role:** The port for the Redis database.
    - **Importance:** High - Critical for Redis access.

## License

MIT
