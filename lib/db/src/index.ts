import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

/**
 * True when a DATABASE_URL is present. Importing this module never throws;
 * consumers that can run without a database (e.g. the API server's in-memory
 * fallback) should gate on this flag and use getDb()/getPool() lazily.
 */
export const isDbConfigured = Boolean(process.env.DATABASE_URL);

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

function requireConfiguration() {
  if (!isDbConfigured) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
}

export function getPool(): pg.Pool {
  requireConfiguration();
  if (!poolInstance) {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return poolInstance;
}

export function getDb(): NodePgDatabase<typeof schema> {
  requireConfiguration();
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export * from "./schema";
export * from "./demoData";