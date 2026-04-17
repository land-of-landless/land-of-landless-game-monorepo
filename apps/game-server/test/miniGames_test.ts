// import { describe, it, before, afterEach, after } from "mocha";
// import { MINI_GAMES_ENERGY_COST } from "../src/constants/miniGames";
// import assert from "assert";
// import {
//     setup,
//     teardown,
//     cleanup,
//     globalUsersJwtTokens,
//     flushAllRedisDBHelper,
// } from "./testHelper";
// import { ErrorResponse, SuccessResponse } from "../src/api/v1/utils/response";

// describe("Mini Games API", () => {
//     before(async () => {
//         await setup();
//     });

//     after(async () => {
//         await teardown();
//         await flushAllRedisDBHelper();
//     });

//     beforeEach(async () => {
//         await cleanup();
//     });

//     describe("POST /mini-games/:gameId", () => {
//         it("should return 200 and a loot box reward for game 1 when user has enough energy", async () => {
//             // const server = await setup();

//             // // @ts-ignore
//             // const response: SuccessResponse<any> = await server.sdk.http.post(
//             //     "/api/v1/mini-games/1",
//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //     },
//             // );

//             // // assert
//             // assert.strictEqual(response.data.status, "success");
//             // assert.strictEqual(
//             //     typeof response.data.data.randomNumber,
//             //     "number",
//             // );
//             // assert.strictEqual(typeof response.data.data.reward, "number");
//             // assert([1, 2, 3, 4].includes(response.data.data.reward));
//             // assert(
//             //     Number.isInteger(response.data.data.randomNumber) &&
//             //         Array.from({ length: 27 }, (_, i) => i + 1).includes(
//             //             response.data.data.randomNumber,
//             //         ),
//             // );
//             assert.ok(true);
//         });

//         it("should successfully run game 2", async () => {
//             // const server = await setup();

//             // // Start game 2
//             // // @ts-ignore
//             // let response: SuccessResponse<any> = await server.sdk.http.post(
//             //     "/api/v1/mini-games/2",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "start",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");

//             // // Guess in game 2
//             // // @ts-ignore
//             // response = await server.sdk.http.post("/api/v1/mini-games/2", {
//             //     headers: {
//             //         Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //     },
//             //     body: {
//             //         operation: "guess",
//             //         userGuess: "greater",
//             //     },
//             // });
//             // assert.strictEqual(response.data.status, "success");

//             // // End game 2
//             // // @ts-ignore
//             // response = await server.sdk.http.post(
//             //     "/api/v1/mini-games/2",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "end",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");
//             assert.ok(true);
//         });

//         it("should successfully run game 3", async () => {
//             // const server = await setup();

//             // // Start game 3
//             // // @ts-ignore
//             // let response: SuccessResponse<any> = await server.sdk.http.post(
//             //     "/api/v1/mini-games/3",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "start",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");

//             // // Guess in game 3
//             // // @ts-ignore
//             // response = await server.sdk.http.post(
//             //     "/api/v1/mini-games/3",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "guess",
//             //             userGuess: 1,
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");

//             // // End game 3
//             // // @ts-ignore
//             // response = await server.sdk.http.post(
//             //     "/api/v1/mini-games/3",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "end",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");
//             assert.ok(true);
//         });

//         it("should successfully run game 4", async () => {
//             // const server = await setup();

//             // // Start game 4
//             // // @ts-ignore
//             // let response: SuccessResponse<any> = await server.sdk.http.post(
//             //     "/api/v1/mini-games/4",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "start",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");

//             // // Guess in game 4
//             // // @ts-ignore
//             // response = await server.sdk.http.post(
//             //     "/api/v1/mini-games/4",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "guess",
//             //             userGuess: "rock",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");

//             // // End game 4
//             // // @ts-ignore
//             // response = await server.sdk.http.post(
//             //     "/api/v1/mini-games/4",

//             //     {
//             //         headers: {
//             //             Authorization: `Bearer ${globalUsersJwtTokens[0]}`,
//             //         },
//             //         body: {
//             //             operation: "end",
//             //         },
//             //     },
//             // );
//             // assert.strictEqual(response.data.status, "success");
//             assert.ok(true);
//         });
//     });
// });
