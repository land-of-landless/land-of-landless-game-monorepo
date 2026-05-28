import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
import * as schema from "../../models/postgres/schema.js";

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL,
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
});

export const db = drizzle(pool, { schema });
    console.error("Unexpected error on idle PostgreSQL client", err);
});

export const db = drizzle(pool, { schema });
