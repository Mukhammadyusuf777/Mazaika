"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var MazaikaDbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazaikaDbService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MazaikaDbService = MazaikaDbService_1 = class MazaikaDbService {
    logger = new common_1.Logger(MazaikaDbService_1.name);
    dbFilePath = path.join(process.cwd(), 'mazaika-cloud-db.json');
    storage = new Map();
    saveInterval;
    onModuleInit() {
        this.loadFromFile();
        this.saveInterval = setInterval(() => this.saveToFile(), 5000);
    }
    onModuleDestroy() {
        clearInterval(this.saveInterval);
        this.saveToFile();
    }
    loadFromFile() {
        try {
            if (fs.existsSync(this.dbFilePath)) {
                const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
                const data = JSON.parse(raw);
                this.storage = new Map(Object.entries(data));
                this.logger.log(`Loaded ${this.storage.size} records from ${this.dbFilePath}`);
            }
        }
        catch (e) {
            this.logger.error(`Failed to load DB file: ${e.message}`);
        }
    }
    saveToFile() {
        try {
            const obj = Object.fromEntries(this.storage);
            fs.writeFileSync(this.dbFilePath, JSON.stringify(obj, null, 2), 'utf-8');
        }
        catch (e) {
            this.logger.error(`Failed to save DB file: ${e.message}`);
        }
    }
    async save(appId, collection, data, customKey) {
        const key = customKey || `${appId}:${collection}:${Date.now()}`;
        this.storage.set(key, {
            appId,
            collection,
            data,
            createdAt: new Date().toISOString()
        });
        this.saveToFile();
        return { success: true, key, data };
    }
    async find(appId, collection) {
        const results = [];
        for (const [k, v] of this.storage.entries()) {
            if (v.appId === appId && v.collection === collection) {
                results.push(v.data);
            }
        }
        return results;
    }
    async findOne(key) {
        const record = this.storage.get(key);
        return record ? record.data : null;
    }
};
exports.MazaikaDbService = MazaikaDbService;
exports.MazaikaDbService = MazaikaDbService = MazaikaDbService_1 = __decorate([
    (0, common_1.Injectable)()
], MazaikaDbService);
//# sourceMappingURL=mazaika-db.service.js.map