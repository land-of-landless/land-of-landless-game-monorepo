import { Router } from "express";
import mainProfileRouter from "./mainProfile";
import miniGamesRouter from "./miniGames";
import shopRouter from "./shop";
import paymentRouter from "./payment";
import energyGeneratorRouter from "./energyGenerator";
import mineRouter from "./mine";
import factoryRouter from "./factory";
import labRouter from "./lab";
import launchSiteRouter from "./launchSite";
import generalRouter from "./general";
import systemHealthRouter from "./system-health";

const v1Router = Router();

v1Router.use("/system-health", systemHealthRouter);

/*
    /general
    all general routes that do not interact with a specific profile but multiple profiles or all and all are general
*/
v1Router.use("/general", generalRouter);

/*
    /main-profile
    all routes that interact with a main profile
*/
v1Router.use("/main-profile", mainProfileRouter);

// TODO: move mini games under main profile routes and logic, since it interacts only with mainProfile
/*
    /mini-games
    all routes that interact with a mini game
*/
v1Router.use("/mini-games", miniGamesRouter);

/*
    /shop
    all routes that interact with a shop
*/
v1Router.use("/shop", shopRouter);

/*
    /payment
    all routes that interact with a payment
*/
v1Router.use("/payment", paymentRouter);

/*
    /energy-generator
    all routes that interact with an energy generator
*/
v1Router.use("/energy-generator", energyGeneratorRouter);

/*
    /mine
    all routes that interact with a mine
*/
v1Router.use("/mine", mineRouter);

/*
    /factory
    all routes that interact with a factory
*/
v1Router.use("/factory", factoryRouter);

/*
    /lab
    all routes that interact with a lab
*/
v1Router.use("/lab", labRouter);

/*
    /launch-site
    all routes that interact with a launch site
*/
v1Router.use("/launch-site", launchSiteRouter);

export default v1Router;
