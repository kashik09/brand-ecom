import postgres from "postgres"

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) throw new Error("DATABASE_URL not set")

// Neon requires SSL; 'require' keeps it simple.
export const sql = postgres(DB_URL, { ssl: "require" })
