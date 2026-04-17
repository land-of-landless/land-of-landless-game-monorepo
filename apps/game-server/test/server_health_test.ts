// import assert from "assert";
// import { setup, teardown, cleanup } from "./testHelper";

// describe("testing /ip", () => {
//     before(async () => {
//         await setup();
//     });

//     after(async () => {
//         await teardown();
//     });

//     beforeEach(async () => {
//         await cleanup();
//     });

//     it("hitting /ip", async () => {
//         const server = await setup();
//         const response = await server.sdk.http.get("/ip");

//         // make your assertions
//         assert.strictEqual(typeof response.data, "string");
//     });

//     it("hitting /ping", async () => {
//         const server = await setup();
//         const response = await server.sdk.http.get("/ping");

//         // make your assertions
//         assert.strictEqual(response.data, "pong");
//     });
// });
