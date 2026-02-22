import "dotenv/config";
import pkg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import generatedPkg from "../generated/prisma/client.js";
const { PrismaClient } = generatedPkg;

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Basic connection test on startup if not in production
if (process.env.NODE_ENV !== "production") {
  prisma.$connect()
    .then(() => console.log("✅ Prisma connected to database"))
    .catch((err) => console.error("❌ Prisma connection error:", err.message));
}

export default prisma;
