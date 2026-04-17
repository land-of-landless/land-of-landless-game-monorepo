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
// import EnergyGeneratorDAO from "../src/daos/redis/energyGenerator";
// import ProfileDAO from "../src/daos/redis/mainProfile";

// describe("Energy Generator API", () => {
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

//     describe("GET /energy-generator/:userId", () => {
//         it("should return 200 and the energy generator profile", async () => {
//             const server = await setup();
//             const response = await server.sdk.http.get(
//                 `/api/v1/energy-generator/${testUserId}`,
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

//     describe("POST /energy-generator/upgrade", () => {
//         it("should successfully upgrade the energy generator", async () => {
//             const server = await setup();

//             // Give user enough coins for upgrade (Level 1 cost is 25000)
//             const profile = await ProfileDAO.findProfileByUserId(testUserId);
//             if (profile) {
//                 profile.coins = 30000;
//                 await ProfileDAO.saveProfile(profile);
//             }

//             // 1. Start Upgrade
//             const startResponse = await server.sdk.http.post(
//                 "/api/v1/energy-generator/upgrade",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "start",
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
//                 "/api/v1/energy-generator/upgrade",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                     body: {
//                         operation: "end-with-gem",
//                     },
//                 },
//             );
//             assert.strictEqual(endResponse.data.status, "success");

//             // Verify level increased
//             const egProfile =
//                 await EnergyGeneratorDAO.findEnergyGeneratorByUserId(
//                     testUserId,
//                 );
//             assert.strictEqual(egProfile?.level, 1, "Level should be 1");
//         });

//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post("/api/v1/energy-generator/upgrade", {
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
//                 await server.sdk.http.post("/api/v1/energy-generator/upgrade", {
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

//     describe("POST /energy-generator/add-panel", () => {
//         it("should successfully add a panel", async () => {
//             const server = await setup();

//             // Setup: Upgrade to level 1 first (level 0 cannot have panels)
//             const profile = await ProfileDAO.findProfileByUserId(testUserId);
//             if (profile) {
//                 profile.coins = 500000; // Enough for upgrade + panel (400k)
//                 await ProfileDAO.saveProfile(profile);
//             }

//             // Upgrade to level 1
//             const egProfile =
//                 await EnergyGeneratorDAO.findEnergyGeneratorByUserId(
//                     testUserId,
//                 );
//             if (egProfile) {
//                 egProfile.level = 1;
//                 await EnergyGeneratorDAO.createEnergyGenerator(egProfile);
//             }

//             const response = await server.sdk.http.post(
//                 "/api/v1/energy-generator/add-panel",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//                     },
//                 },
//             );
//             assert.strictEqual(response.data.status, "success");

//             // Verify panel count increased
//             const updatedEgProfile =
//                 await EnergyGeneratorDAO.findEnergyGeneratorByUserId(
//                     testUserId,
//                 );
//             assert.strictEqual(
//                 updatedEgProfile?.panel_count,
//                 1,
//                 "Panel count should be 1",
//             );
//         });

//         it("should return an error for an unauthorized request", async () => {
//             const server = await setup();
//             try {
//                 await server.sdk.http.post(
//                     "/api/v1/energy-generator/add-panel",
//                 );
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
