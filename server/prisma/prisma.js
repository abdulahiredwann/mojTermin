const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

module.exports = prisma; // Use module.exports for CommonJS
