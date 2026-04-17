import "dotenv/config";
import {
    MongoClient,
    ServerApiVersion,
    ObjectId,
    Collection,
    Document,
} from "mongodb";
import mongoose from "mongoose";
import { dbLogger } from "../../utils/logger";
import _ from "lodash";
import Redis from "ioredis";

let mongoDbUser = encodeURIComponent(process.env.MONGO_DB_USER as string);
let mongoDbPass = encodeURIComponent(process.env.MONGO_DB_PASS as string);
const uri = `mongodb+srv://${mongoDbUser}:${mongoDbPass}@lol-game.9mcaymn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let authDBConn = mongoose.createConnection(uri, {
    autoIndex: false,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    dbName: "auth",
});

let billingDBConn = mongoose.createConnection(uri, {
    autoIndex: false,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    dbName: "billing",
});

async function connectDb() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await mongoClient.connect();
        // Send a ping to confirm a successful connection
        await mongoClient.db("admin").command({ ping: 1 });
        dbLogger.info(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );

        mongoose.connect(uri, {
            autoIndex: false,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            dbName: "auth",
        });

        // sessionsCol = await client.db("auth").collection("sessions");
        // usersCol = await client.db("auth").collection("users");
        // accountsCol = await client.db("auth").collection("accounts");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

// redis client
// let redisClient = new Redis(
//   "redis://default:3oFUo2ic4anuBH5KQTqmQRJawHZcUMk5@redis-16276.c56.east-us.azure.cloud.redislabs.com:16276"
// );

export { mongoClient, connectDb, authDBConn, billingDBConn };
