import { Pool } from "pg";

let pool: Pool | null = null;

export function getEstatePool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL_ESTATE || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL_ESTATE or DATABASE_URL is not set");
  }
  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000
  });
  return pool;
}
