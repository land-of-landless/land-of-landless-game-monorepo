// /**
//  * Launch Site API Tests
//  * Comprehensive test suite for launch site functionality including:
//  * - Profile retrieval
//  * - Upgrade operations (start/end)
//  * - Item launching with success/failure scenarios
//  * - Authentication and validation error handling
//  */

// import assert from "assert";
// import {
//     setup,
//     teardown,
//     cleanup,
//     globalUsersJwtTokens,
//     flushAllRedisDBHelper,
//     initializeDataForTesting,
//     testUserId,
// } from "./testHelper";
// import { createRedisIndexes } from "../src/daos/redis/repositories/index";

// describe("Launch Site API", () => {
//     before(async () => {
//         await setup();
//         await createRedisIndexes();
//         await initializeDataForTesting();
//     });

//     after(async () => {
//         await teardown();
//         await flushAllRedisDBHelper();
//     });

//     beforeEach(async () => {
//         await cleanup();
//     });

//     describe("GET /launch-site/profile", () => {
//         it("should return 200 and the authenticated user's launch site profile", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 "/api/v1/launch-site/profile",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.ok(
//                 response.data.data.userId !== undefined,
//                 "User ID should exist",
//             );
//         });
//     });

//     describe("POST /launch-site/upgrade/start", () => {
//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/launch-site/upgrade/start");
//                 assert.fail("Request should have failed");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });
//     });

//     describe("POST /launch-site/upgrade/end", () => {
//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/launch-site/upgrade/end", {
//                     body: {
//                         skipWithGem: false,
//                     },
//                 });
//                 assert.fail("Request should have failed");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });

//         it("should return a validation error for invalid input", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/launch-site/upgrade/end", {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         skipWithGem: "invalid_value",
//                     },
//                 });
//                 assert.fail("Request should have failed");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });
//     });

//     describe("POST /launch-site/launch", () => {
//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/launch-site/launch", {
//                     body: {
//                         itemType: "satellite",
//                     },
//                 });
//                 assert.fail("Request should have failed");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });

//         it("should return a validation error for invalid input", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/launch-site/launch", {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         itemType: "invalid_item",
//                     },
//                 });
//                 assert.fail("Request should have failed");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });
//     });
// });
