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
// import { MineDAO } from "../src/daos/redis/mine";
// import ProfileDAO from "../src/daos/redis/mainProfile";

// describe("Mine API", () => {
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

//     describe("GET /mine/:userId", () => {
//         it("should return 200 and the mine profile", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 `/api/v1/mine/${testUserId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");
//             assert.strictEqual(response.data.data.userId, testUserId);
//             assert.ok(response.data.data.levels, "Levels should exist");
//         });
//     });

//     describe("POST /mine/upgrade", () => {
//         it("should successfully upgrade the mine", async () => {
//             const server = await setup();

//             // Give user enough coins for upgrade (Level 1 cost is 25000)
//             const profile = await ProfileDAO.findProfileByUserId(testUserId);
//             if (profile) {
//                 profile.coins = 30000;
//                 await ProfileDAO.saveProfile(profile);
//             }

//             // 1. Start Upgrade
//             const startResponse = await server.sdk.http.post(
//                 "/api/v1/mine/upgrade",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "start",
//                         mineId: 0,
//                     },
//                 },
//             );
//             assert.strictEqual(startResponse.data.status, "success");
//             assert.ok(
//                 startResponse.data.data.startToUpgradeTime,
//                 "Start time should be returned",
//             );

//             // 2. End Upgrade with Gem (to avoid waiting)
//             const endResponse = await server.sdk.http.post(
//                 "/api/v1/mine/upgrade",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "end-with-gem",
//                         mineId: 0,
//                     },
//                 },
//             );
//             assert.strictEqual(endResponse.data.status, "success");

//             // Verify level increased
//             const mineProfile = await MineDAO.findMineByUserId(testUserId);
//             assert.strictEqual(
//                 mineProfile?.levels[0],
//                 1,
//                 "Miner level should be 1",
//             );
//         });

//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/mine/upgrade", {
//                     body: {
//                         operation: "start",
//                         mineId: 0,
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
//                 await server.sdk.http.post("/api/v1/mine/upgrade", {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "invalid_operation",
//                         mineId: 0,
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
