import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance to avoid exhausting DB connections.
const prisma = new PrismaClient();

export default prisma;
