import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private dbInstance: Firestore;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      if (getApps().length === 0) {
        // 1) Try to load from service account file first
        const saPath = path.join(process.cwd(), 'firebase-service-account.json');
        if (fs.existsSync(saPath)) {
          this.logger.log(`Initializing Firebase with local service account: ${saPath}`);
          const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
          initializeApp({
            credential: cert(serviceAccount),
          });
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
          // 2) Try env variables (Render/Prod)
          this.logger.log('Initializing Firebase with environment variables');
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
        } else {
          // 3) Bypassed/Development fallback using default settings (useful if running in public tests)
          this.logger.warn('No Firebase credentials found! Using default initializeApp for mazaika-uz project');
          initializeApp({
            projectId: 'mazaika-uz',
          });
        }
      }
      this.dbInstance = getFirestore();
    } catch (e: any) {
      this.logger.error(`Firebase initialization failed: ${e.message}`);
      this.dbInstance = getFirestore();
    }
  }

  get db(): Firestore {
    return this.dbInstance;
  }

  // Helper CRUD methods
  async getActiveBots() {
    const snap = await this.db.collection('bots').where('status', '==', 'active').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  async getBot(botId: string) {
    const snap = await this.db.collection('bots').doc(botId).get();
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as any;
    }
    return null;
  }

  async updateBotStatus(botId: string, status: string) {
    await this.db.collection('bots').doc(botId).update({ status, updatedAt: new Date() }).catch(() => {});
  }

  async getBotWorkflow(botId: string) {
    // In our Firestore setup, main workflow is stored at bots/{botId}/workflows/main
    const snap = await this.db.collection('bots').doc(botId).collection('workflows').doc('main').get();
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as any;
    }
    return null;
  }

  async getContact(botId: string, telegramId: string) {
    const snap = await this.db
      .collection('bots')
      .doc(botId)
      .collection('contacts')
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();
    
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as any;
    }
    return null;
  }

  async createContact(botId: string, data: any) {
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

  async updateContactState(botId: string, contactId: string, state: string) {
    await this.db
      .collection('bots')
      .doc(botId)
      .collection('contacts')
      .doc(contactId)
      .update({ state, updatedAt: new Date() });
  }

  async addMessage(botId: string, contactId: string, text: string, direction: 'inbound' | 'outbound') {
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
}
