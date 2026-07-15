/**
 * Firebase Firestore — все операции с базой данных
 * Коллекции: users, bots, workflows, contacts, webhooks
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================================
// USERS
// ============================================================
export async function createOrUpdateUser(uid: string, data: { name: string; email?: string | null; phone?: string | null }) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getUser(uid: string): Promise<any> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

// ============================================================
// BOTS
// ============================================================
export async function getBotsByUser(userId: string): Promise<any[]> {
  const q = query(collection(db, 'bots'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function getBotById(botId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

export async function createBot(userId: string, data: { name: string; token: string; template?: string }): Promise<any> {
  const ref = await addDoc(collection(db, 'bots'), {
    ...data,
    userId,
    status: 'active',
    users: 0,
    messages: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, userId, status: 'active' }
}

export async function updateBot(botId: string, data: Partial<{ name: string; token: string; status: string }>) {
  await updateDoc(doc(db, 'bots', botId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteBot(botId: string) {
  await deleteDoc(doc(db, 'bots', botId))
}

// ============================================================
// WORKFLOWS
// ============================================================
export async function getWorkflows(botId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'workflows'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function getWorkflow(botId: string, workflowId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId, 'workflows', workflowId))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

export async function saveWorkflow(botId: string, workflowId: string, data: { name: string; nodes: any[]; edges: any[]; isMain?: boolean }) {
  await setDoc(doc(db, 'bots', botId, 'workflows', workflowId), {
    ...data,
    nodes: JSON.stringify(data.nodes),
    edges: JSON.stringify(data.edges),
    botId,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createWorkflow(botId: string, data: { name: string; nodes: any[]; edges: any[]; isMain?: boolean }): Promise<string> {
  const ref = await addDoc(collection(db, 'bots', botId, 'workflows'), {
    ...data,
    nodes: JSON.stringify(data.nodes),
    edges: JSON.stringify(data.edges),
    botId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteWorkflow(botId: string, workflowId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'workflows', workflowId))
}

// ============================================================
// WEBHOOKS
// ============================================================
export async function getWebhooks(botId: string): Promise<any[]> {
  const snap = await getDocs(collection(db, 'bots', botId, 'webhooks'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function createWebhook(botId: string, data: { name: string; url: string; method: string }): Promise<any> {
  const ref = await addDoc(collection(db, 'bots', botId, 'webhooks'), {
    ...data,
    active: true,
    botId,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, active: true }
}

export async function deleteWebhook(botId: string, webhookId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'webhooks', webhookId))
}

// ============================================================
// CONTACTS
// ============================================================
export async function getContacts(botId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'contacts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

// ============================================================
// MESSAGES (Chats)
// ============================================================
export async function getMessages(botId: string, contactId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'contacts', contactId, 'messages'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}
