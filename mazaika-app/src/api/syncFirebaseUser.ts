import { apiClient } from './apiClient'

/**
 * After Firebase login, call this to sync the Firebase user
 * with our PostgreSQL database. Returns our DB user (with real UUID).
 */
export async function syncFirebaseUser(firebaseUser: {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
}) {
  try {
    const res = await apiClient.post('/auth/firebase-sync', {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      name: firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || 'User',
      phone: firebaseUser.phoneNumber || undefined,
    })
    if (res.data.success) return res.data.user
    return null
  } catch {
    return null
  }
}
