import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { Database } from "./types"; // this is the Database interface we defined earlier
import moment from "moment";

const int8TypeId = 20;
const timestampTypeId = 1184;
const timestampWithTimeZoneTypeId = 1114;

pg.types.setTypeParser(int8TypeId, (val: string) => {
  return parseInt(val);
});

const parseFn = (val: string) => {
  return val == null ? null : moment.utc(val);
};
pg.types.setTypeParser(timestampTypeId, parseFn);
pg.types.setTypeParser(timestampWithTimeZoneTypeId, parseFn);
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 10,
  options: "-c search_path=myschema",
});
const dialect = new PostgresDialect({
  pool,
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
