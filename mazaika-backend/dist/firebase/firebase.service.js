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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FirebaseService = FirebaseService_1 = class FirebaseService {
    logger = new common_1.Logger(FirebaseService_1.name);
    dbInstance;
    constructor() {
        this.initFirebase();
    }
    initFirebase() {
        try {
            if ((0, app_1.getApps)().length === 0) {
                const saPath = path.join(process.cwd(), 'firebase-service-account.json');
                if (fs.existsSync(saPath)) {
                    this.logger.log(`Initializing Firebase with local service account: ${saPath}`);
                    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
                    (0, app_1.initializeApp)({
                        credential: (0, app_1.cert)(serviceAccount),
                    });
                }
                else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
                    this.logger.log('Initializing Firebase with environment variables');
                    (0, app_1.initializeApp)({
                        credential: (0, app_1.cert)({
                            projectId: process.env.FIREBASE_PROJECT_ID,
                            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
                            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                        }),
                    });
                }
                else {
                    this.logger.warn('No Firebase credentials found! Using default initializeApp for mazaika-uz project');
                    (0, app_1.initializeApp)({
                        projectId: 'mazaika-uz',
                    });
                }
            }
            this.dbInstance = (0, firestore_1.getFirestore)();
        }
        catch (e) {
            this.logger.error(`Firebase initialization failed: ${e.message}`);
            this.dbInstance = (0, firestore_1.getFirestore)();
        }
    }
    get db() {
        return this.dbInstance;
    }
    async getActiveBots() {
        const snap = await this.db.collection('bots').where('status', '==', 'active').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async getBot(botId) {
        const snap = await this.db.collection('bots').doc(botId).get();
        if (snap.exists) {
            return { id: snap.id, ...snap.data() };
        }
        return null;
    }
    async updateBotStatus(botId, status) {
        await this.db.collection('bots').doc(botId).update({ status, updatedAt: new Date() }).catch(() => { });
    }
    async getBotWorkflow(botId) {
        const snap = await this.db.collection('bots').doc(botId).collection('workflows').doc('main').get();
        if (snap.exists) {
            return { id: snap.id, ...snap.data() };
        }
        return null;
    }
    async getContact(botId, telegramId) {
        const snap = await this.db
            .collection('bots')
            .doc(botId)
            .collection('contacts')
            .where('telegramId', '==', telegramId)
            .limit(1)
            .get();
        if (!snap.empty) {
            const doc = snap.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    }
    async createContact(botId, data) {
        const ref = this.db.collection('bots').doc(botId).collection('contacts').doc();
        const contactData = {
            ...data,
            id: ref.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await ref.set(contactData);
        return contactData;
    }
    async updateContactState(botId, contactId, state) {
        await this.db
            .collection('bots')
            .doc(botId)
            .collection('contacts')
            .doc(contactId)
            .update({ state, updatedAt: new Date() });
    }
    async addMessage(botId, contactId, text, direction) {
        await this.db
            .collection('bots')
            .doc(botId)
            .collection('contacts')
            .doc(contactId)
            .collection('messages')
            .add({
            text,
            direction,
            createdAt: new Date(),
        });
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map