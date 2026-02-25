"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});
console.log(!!prisma);
