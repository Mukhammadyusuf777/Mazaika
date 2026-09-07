"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    isConnected = false;
    async onModuleInit() {
        try {
            if (!process.env.DATABASE_URL) {
                this.logger.warn('⚠️ DATABASE_URL is not set. Prisma running in offline fallback mode.');
                return;
            }
            if (process.env.DATABASE_URL.startsWith('postgres://')) {
                process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://');
            }
            await this.$connect();
            this.isConnected = true;
            this.logger.log('✅ Connected to PostgreSQL database via Prisma');
            try {
                await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "email" TEXT UNIQUE,
            "phone" TEXT UNIQUE,
            "name" TEXT NOT NULL,
            "password" TEXT,
            "googleId" TEXT UNIQUE,
            "firebaseUid" TEXT UNIQUE,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Bot" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "token" TEXT UNIQUE,
            "status" TEXT NOT NULL DEFAULT 'active',
            "projectType" TEXT NOT NULL DEFAULT 'bot',
            "userId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Site" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "botId" TEXT UNIQUE,
            "userId" TEXT NOT NULL,
            "slug" TEXT NOT NULL UNIQUE,
            "appName" TEXT NOT NULL,
            "theme" TEXT NOT NULL DEFAULT 'glassmorphism',
            "themeColor" TEXT NOT NULL DEFAULT '#00D9FF',
            "sourceCode" TEXT NOT NULL,
            "files" TEXT NOT NULL,
            "blocks" TEXT,
            "isPublished" BOOLEAN NOT NULL DEFAULT true,
            "cloudflareUrl" TEXT,
            "views" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Workflow" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "isMain" BOOLEAN NOT NULL DEFAULT false,
            "nodes" TEXT NOT NULL,
            "edges" TEXT NOT NULL,
            "botId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Contact" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "telegramId" TEXT NOT NULL,
            "firstName" TEXT,
            "lastName" TEXT,
            "username" TEXT,
            "languageCode" TEXT,
            "state" TEXT,
            "botId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Message" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "text" TEXT,
            "direction" TEXT NOT NULL,
            "contactId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS "Webhook" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "method" TEXT NOT NULL DEFAULT 'POST',
            "active" BOOLEAN NOT NULL DEFAULT true,
            "botId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
                this.logger.log('✅ PostgreSQL schema verified and synchronized');
            }
            catch (schemaErr) {
                this.logger.warn(`Schema synchronization notice: ${schemaErr?.message || schemaErr}`);
            }
        }
        catch (err) {
            this.isConnected = false;
            this.logger.error(`⚠️ Prisma database connection warning: ${err?.message || err}. Backend will continue running in resilient mode.`);
        }
    }
    async onModuleDestroy() {
        if (this.isConnected) {
            try {
                await this.$disconnect();
            }
            catch { }
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map