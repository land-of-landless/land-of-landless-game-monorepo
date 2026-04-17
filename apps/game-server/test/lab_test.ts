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
// import { LabDAO } from "../src/daos/redis/lab";

// describe("Lab API", () => {
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

//     describe("GET /lab/:userId", () => {
//         it("should return 200 and the lab profile", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 `/api/v1/lab/${testUserId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.strictEqual(response.data.data.userId, testUserId);
//             assert.ok(
//                 response.data.data.level !== undefined,
//                 "Level should exist",
//             );
//         });
//     });

//     describe("POST /lab/upgrade", () => {
//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/lab/upgrade", {
//                     body: {
//                         operation: "start",
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
//                 await server.sdk.http.post("/api/v1/lab/upgrade", {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "invalid_operation",
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

//     describe("POST /lab/upgrade-item", () => {
//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/lab/upgrade-item", {
//                     body: {
//                         itemId: "generalTech",
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
//                 await server.sdk.http.post("/api/v1/lab/upgrade-item", {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         itemId: "invalid_item",
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
