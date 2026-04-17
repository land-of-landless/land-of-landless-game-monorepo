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
// import { ErrorResponse, SuccessResponse } from "../src/api/v1/utils/response";
// import { createRedisIndexes } from "../src/daos/redis/repositories/index";
// import ProfileDAO from "../src/daos/redis/mainProfile";

// describe("Profile API", () => {
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

//     describe("GET /main-profile/authenticated", () => {
//         it("should return 200 and the user profile when a valid token is provided", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 "/api/v1/main-profile/authenticated",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.ok(response.data.data, "Profile data should exist");
//             assert.ok(typeof response.data.data.refCode, "string");
//         });

//         it("should return an error when no token is provided", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.get("/api/v1/main-profile/authenticated");
//                 assert.fail("Request should have failed but it succeeded");
//             } catch (error: any) {
//                 // The error code might be 401 or 500 depending on implementation, usually 401 for missing auth
//                 // Checking if it's an error response
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });
//     });

//     describe("GET /main-profile/:userId", () => {
//         it("should return 200 and the correct user's profile", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 `/api/v1/main-profile/${testUserId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.strictEqual(response.data.data.userId, testUserId);
//         });
//     });

//     // describe("GET /profile/all/:userId", () => {
//     //     it("should return 200 and all profiles for the user", async () => {
//     //         const server = await setup();
//     //         const response = await server.sdk.http.get(
//     //             `/api/v1/main-profile/all/${testUserId}`,
//     //             {
//     //                 headers: {
//     //                     Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//     //                 },
//     //             },
//     //         );
//     //         assert.strictEqual(response.data.status, "success");
//     //         assert.ok(response.data.data.profile, "Profile should exist");
//     //         assert.ok(response.data.data.mine, "Mine profile should exist");
//     //         assert.ok(
//     //             response.data.data.energyGenerator,
//     //             "EnergyGenerator profile should exist",
//     //         );
//     //         assert.ok(
//     //             response.data.data.factory,
//     //             "Factory profile should exist",
//     //         );
//     //         assert.ok(response.data.data.lab, "Lab profile should exist");
//     //         assert.ok(
//     //             response.data.data.launchSite,
//     //             "LaunchSite profile should exist",
//     //         );
//     //         assert.ok(response.data.data.games, "Games profile should exist");
//     //     });
//     // });

//     describe("POST /profile/lootbox/open", () => {
//         it("should return 200 and start opening a lootbox with a valid token and body", async () => {
//             const server = await setup();
//             // Give the user a lootbox to open
//             await ProfileDAO.addLootBox(testUserId, 1);

//             const response = await server.sdk.http.post(
//                 "/api/v1/main-profile/lootbox/open",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         lootBoxIndex: 0,
//                         operation: "start",
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.ok(
//                 response.data.data.startToOpenTime,
//                 "Lootbox start time should be returned",
//             );
//         });

//         it("should return an error when no token is provided", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post(
//                     "/api/v1/main-profile/lootbox/open",
//                     {
//                         body: {
//                             lootBoxIndex: 0,
//                             operation: "start",
//                         },
//                     },
//                 );
//                 assert.fail("Request should have failed but it succeeded");
//             } catch (error: any) {
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });

//         it("should return a validation error when an invalid body is provided", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post(
//                     "/api/v1/main-profile/lootbox/open",
//                     {
//                         headers: {
//                             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                         },
//                         body: {
//                             lootBoxIndex: 99,
//                             operation: "invalid_operation",
//                         },
//                     },
//                 );
//                 assert.fail("Request should have failed but it succeeded");
//             } catch (error: any) {
//                 // Expecting validation error (likely 400)
//                 assert.ok(
//                     error.response || error.code,
//                     "Should return an error",
//                 );
//             }
//         });
//     });
// });
