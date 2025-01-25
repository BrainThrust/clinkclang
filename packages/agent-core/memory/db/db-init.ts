import pg from "pg";
import { config } from "dotenv";
config({ path: __dirname + "./../../../../.env" });

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL!,
});

(async () => {
  try {
    await client.connect();
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  } catch (e) {
    console.error(e);
  }
})();
