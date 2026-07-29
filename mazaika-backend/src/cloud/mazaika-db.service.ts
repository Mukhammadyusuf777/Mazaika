import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MazaikaDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MazaikaDbService.name);
  private readonly dbFilePath = path.join(process.cwd(), 'mazaika-cloud-db.json');
  private storage: Map<string, any> = new Map();
  private saveInterval: NodeJS.Timeout;

  onModuleInit() {
    this.loadFromFile();
    // Auto-save to disk every 5 seconds if there are changes (handled by interval to avoid blocking)
    this.saveInterval = setInterval(() => this.saveToFile(), 5000);
  }

  onModuleDestroy() {
    clearInterval(this.saveInterval);
    this.saveToFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        this.storage = new Map(Object.entries(data));
        this.logger.log(`Loaded ${this.storage.size} records from ${this.dbFilePath}`);
      }
    } catch (e) {
      this.logger.error(`Failed to load DB file: ${e.message}`);
    }
  }

  private saveToFile() {
    try {
      const obj = Object.fromEntries(this.storage);
      fs.writeFileSync(this.dbFilePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      this.logger.error(`Failed to save DB file: ${e.message}`);
    }
  }

  async save(appId: string, collection: string, data: any, customKey?: string) {
    const key = customKey || `${appId}:${collection}:${Date.now()}`;
    this.storage.set(key, {
      appId,
      collection,
      data,
      createdAt: new Date().toISOString()
    });
    // Trigger immediate save for important data
    this.saveToFile();
    return { success: true, key, data };
  }

  async find(appId: string, collection: string) {
    const results = [];
    for (const [k, v] of this.storage.entries()) {
      if (v.appId === appId && v.collection === collection) {
        results.push(v.data);
      }
    }
    return results;
  }

  async findOne(key: string) {
    const record = this.storage.get(key);
    return record ? record.data : null;
  }
}

