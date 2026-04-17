import basicAuth from "express-basic-auth";

const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
        admin: "admin2",
    },
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true,
    unauthorizedResponse: () => {
        return {
            status: 401,
            message: "You shall not pass!",
        };
    },
});

export default basicAuthMiddleware;
