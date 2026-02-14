import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;
