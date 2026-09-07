import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  async onModuleInit() {
    try {
      if (!process.env.DATABASE_URL) {
        this.logger.warn('⚠️ DATABASE_URL is not set. Prisma running in offline fallback mode.');
        return;
      }

      // Render often injects postgres:// which Prisma requires to be postgresql://
      if (process.env.DATABASE_URL.startsWith('postgres://')) {
        process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://');
      }

      await this.$connect();
      this.isConnected = true;
      this.logger.log('✅ Connected to PostgreSQL database via Prisma');

      // Self-healing schema: auto-create all missing tables if not exist
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
      } catch (schemaErr: any) {
        this.logger.warn(`Schema synchronization notice: ${schemaErr?.message || schemaErr}`);
      }
    } catch (err: any) {
      this.isConnected = false;
      this.logger.error(`⚠️ Prisma database connection warning: ${err?.message || err}. Backend will continue running in resilient mode.`);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.$disconnect();
      } catch {}
    }
  }
}
