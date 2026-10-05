import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { Registration, RegistrationFormData, CheckInLog } from '../types';
import { EVENT_CONFIG } from '../config/event';
import { getFirebaseDb, isFirebaseConfigured } from './firebase';

const FIRESTORE_COLLECTION = 'inscrits';
const CHECKIN_LOGS_COLLECTION = 'emargements_logs';

// Simple HMAC-like deterministic hash signature generator for offline & online verification
export function generateQrSignature(id: string, secret: string = EVENT_CONFIG.security.hmacSecret): string {
  let hash = 0;
  const combined = `${id}:${secret}:jnum2026`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex;
}

export function verifyQrSignature(id: string, signature: string): boolean {
  if (!id || !signature) return false;
  const expected = generateQrSignature(id);
  return expected.toLowerCase() === signature.trim().toLowerCase();
}

// Generate unique 6-character non-ambiguous identifier: JNUM-2026-XXXXXX
export function generateRegistrationId(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }
  return `JNUM-${EVENT_CONFIG.year}-${randomPart}`;
}

// In-memory cache synced via Firestore onSnapshot
let memoryRegistrations: Registration[] = [];

/**
 * Real-time listener for Firestore 'inscrits' collection
 * Notifies components whenever registrations change across any device.
 */
export function subscribeToRegistrations(callback: (registrations: Registration[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  if (!db) {
    callback(memoryRegistrations);
    return () => {};
  }

  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Registration[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          whatsappPhone: data.whatsappPhone || '',
          phoneNumber: data.phoneNumber || data.whatsappPhone || '',
          country: data.country || "Côte d'Ivoire",
          city: data.city || 'Abidjan',
          category: data.category || 'Professionnel',
          role: data.role || 'Participant',
          organization: data.organization || '',
          jobTitle: data.jobTitle || '',
          interests: data.interests || [],
          referralSource: data.referralSource || '',
          workshopIds: data.workshopIds || [],
          consentData: Boolean(data.consentData),
          consentWhatsapp: Boolean(data.consentWhatsapp),
          createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          qrSignature: data.qrSignature || generateQrSignature(docSnap.id),
          qrVerificationUrl: data.qrVerificationUrl || '',
          badgeUrl: data.badgeUrl,
          whatsappStatus: data.whatsappStatus || 'pending',
          whatsappAttempts: data.whatsappAttempts,
          lastWhatsappAttempt: data.lastWhatsappAttempt,
          checkedIn: Boolean(data.checkedIn),
          checkedInAt: typeof data.checkedInAt === 'string' ? data.checkedInAt : data.checkedInAt?.toDate ? data.checkedInAt.toDate().toISOString() : data.checkedInAt,
          checkedInBy: data.checkedInBy,
          notes: data.notes,
        });
      });

      memoryRegistrations = list;
      callback(list);
      window.dispatchEvent(new Event('jnum_registrations_updated'));
    },
    (error) => {
      console.error('Firestore onSnapshot error on inscrits:', error);
      callback(memoryRegistrations);
    }
  );
}

// Get in-memory list (synchronous helper for calculations)
export function getAllRegistrations(): Registration[] {
  return memoryRegistrations;
}

// Fetch single registration by ID (directly from Firestore or memory)
export async function fetchRegistrationById(id: string): Promise<Registration | null> {
  const cleanId = id.trim();
  // Check memory first
  const cached = memoryRegistrations.find((r) => r.id.toLowerCase() === cleanId.toLowerCase());
  if (cached) return cached;

  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      whatsappPhone: data.whatsappPhone || '',
      phoneNumber: data.phoneNumber || data.whatsappPhone || '',
      country: data.country || "Côte d'Ivoire",
      city: data.city || 'Abidjan',
      category: data.category || 'Professionnel',
      role: data.role || 'Participant',
      organization: data.organization || '',
      jobTitle: data.jobTitle || '',
      interests: data.interests || [],
      referralSource: data.referralSource || '',
      workshopIds: data.workshopIds || [],
      consentData: Boolean(data.consentData),
      consentWhatsapp: Boolean(data.consentWhatsapp),
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      qrSignature: data.qrSignature || generateQrSignature(snap.id),
      qrVerificationUrl: data.qrVerificationUrl || '',
      badgeUrl: data.badgeUrl,
      whatsappStatus: data.whatsappStatus || 'pending',
      checkedIn: Boolean(data.checkedIn),
      checkedInAt: typeof data.checkedInAt === 'string' ? data.checkedInAt : data.checkedInAt?.toDate ? data.checkedInAt.toDate().toISOString() : data.checkedInAt,
      checkedInBy: data.checkedInBy,
      notes: data.notes,
    };
  } catch (err) {
    console.error('Error fetching registration from Firestore:', err);
    return null;
  }
}

// Backward-compatible synchronous getter
export function getRegistrationById(id: string): Registration | null {
  const cleanId = id.trim().toLowerCase();
  return memoryRegistrations.find((r) => r.id.toLowerCase() === cleanId) || null;
}

// Check duplicate across existing registrations
export async function checkDuplicateInCloud(email?: string, phone?: string): Promise<{ isDuplicate: boolean; field?: 'email' | 'phone' }> {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  // Check in current memory pool
  if (cleanEmail && cleanEmail.length > 0) {
    const dupEmail = memoryRegistrations.find((r) => r.email && r.email.trim().toLowerCase() === cleanEmail);
    if (dupEmail) return { isDuplicate: true, field: 'email' };
  }

  if (cleanPhone) {
    const dupPhone = memoryRegistrations.find((r) => r.whatsappPhone.replace(/[^0-9]/g, '') === cleanPhone);
    if (dupPhone) return { isDuplicate: true, field: 'phone' };
  }

  // Also query Firestore if not in memory
  const db = getFirebaseDb();
  if (db && memoryRegistrations.length === 0) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      let foundDup: { isDuplicate: boolean; field?: 'email' | 'phone' } = { isDuplicate: false };
      snap.forEach((d) => {
        const row = d.data();
        if (cleanEmail && row.email && row.email.trim().toLowerCase() === cleanEmail) {
          foundDup = { isDuplicate: true, field: 'email' };
        }
        if (cleanPhone && row.whatsappPhone && row.whatsappPhone.replace(/[^0-9]/g, '') === cleanPhone) {
          foundDup = { isDuplicate: true, field: 'phone' };
        }
      });
      if (foundDup.isDuplicate) return foundDup;
    } catch {
      // Ignore network errors on duplicate query
    }
  }

  return { isDuplicate: false };
}

/**
 * CREATE NEW REGISTRATION DIRECTLY IN FIRESTORE
 */
export async function createRegistration(data: RegistrationFormData): Promise<Registration> {
  const duplicate = await checkDuplicateInCloud(data.email, data.phoneNumber);
  if (duplicate.isDuplicate) {
    throw new Error(
      duplicate.field === 'email'
        ? 'Une inscription avec cette adresse email existe déjà.'
        : 'Une inscription avec ce numéro WhatsApp existe déjà.'
    );
  }

  const id = generateRegistrationId();
  const signature = generateQrSignature(id);
  const origin = typeof window !== 'undefined' ? window.location.origin : EVENT_CONFIG.social.domain;
  const qrVerificationUrl = `${origin}/verify/${id}?t=${signature}`;

  const cleanPhone = data.phoneNumber.startsWith('+') ? data.phoneNumber : `${data.phoneCountryCode}${data.phoneNumber}`;
  const cleanEmail = data.email?.trim().toLowerCase() || '';

  const newReg: Registration = {
    id,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: cleanEmail,
    whatsappPhone: cleanPhone,
    phoneNumber: cleanPhone,
    country: data.country,
    city: data.city,
    category: data.category,
    role: 'Participant',
    organization: data.organization.trim() || 'Indépendant',
    jobTitle: data.jobTitle.trim() || 'Participant',
    interests: data.interests,
    referralSource: data.referralSource,
    workshopIds: data.workshopIds || [],
    consentData: data.consentData,
    consentWhatsapp: data.consentWhatsapp,
    createdAt: new Date().toISOString(),
    qrSignature: signature,
    qrVerificationUrl,
    whatsappStatus: 'pending',
    checkedIn: false,
  };

  const db = getFirebaseDb();
  if (db) {
    const docRef = doc(db, FIRESTORE_COLLECTION, id);
    await setDoc(docRef, {
      ...newReg,
      serverCreatedAt: serverTimestamp(),
    });
  }

  // Update local memory cache immediately
  memoryRegistrations = [newReg, ...memoryRegistrations.filter((r) => r.id !== id)];
  window.dispatchEvent(new Event('jnum_registrations_updated'));

  return newReg;
}

/**
 * UPDATE REGISTRATION STATUS (ÉMARGEMENT)
 */
export async function updateRegistrationStatus(id: string, updates: Partial<Registration>): Promise<Registration | null> {
  const db = getFirebaseDb();
  const targetId = id.trim();

  if (db) {
    const docRef = doc(db, FIRESTORE_COLLECTION, targetId);
    await updateDoc(docRef, updates as any);
  }

  // Update memory
  const idx = memoryRegistrations.findIndex((r) => r.id.toLowerCase() === targetId.toLowerCase());
  if (idx !== -1) {
    memoryRegistrations[idx] = { ...memoryRegistrations[idx], ...updates };
    window.dispatchEvent(new Event('jnum_registrations_updated'));
    return memoryRegistrations[idx];
  }

  return null;
}

/**
 * PERFORM CHECK-IN (SCAN OU ADMIN)
 */
export async function checkInParticipant(
  id: string,
  scannedBy: string = 'Staff JNUM'
): Promise<{ success: boolean; registration?: Registration; message: string }> {
  let reg = await fetchRegistrationById(id);
  if (!reg) {
    return { success: false, message: 'Participant introuvable.' };
  }

  if (reg.checkedIn) {
    return {
      success: false,
      registration: reg,
      message: `Déjà émargé le ${new Date(reg.checkedInAt || '').toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    };
  }

  const nowIso = new Date().toISOString();
  const updated = await updateRegistrationStatus(id, {
    checkedIn: true,
    checkedInAt: nowIso,
    checkedInBy: scannedBy,
  });

  // Log in Firestore if possible
  const db = getFirebaseDb();
  if (db) {
    const logDoc = doc(collection(db, CHECKIN_LOGS_COLLECTION));
    setDoc(logDoc, {
      registrationId: reg.id,
      participantName: `${reg.firstName} ${reg.lastName}`,
      category: reg.category,
      role: reg.role,
      scannedAt: nowIso,
      scannedBy,
      status: 'valid',
    }).catch((err) => console.warn('Checkin log write error:', err));
  }

  return {
    success: true,
    registration: updated || { ...reg, checkedIn: true, checkedInAt: nowIso, checkedInBy: scannedBy },
    message: 'Entrée confirmée avec succès !',
  };
}

/**
 * VERIFY BADGE FOR DISPLAY / ACCESS
 */
export function verifyRegistrationBadge(
  id: string,
  providedSignature?: string
): {
  valid: boolean;
  status: 'valid' | 'already_scanned' | 'invalid_id' | 'invalid_signature';
  registration?: Registration;
  message: string;
} {
  const reg = getRegistrationById(id);
  if (!reg) {
    return {
      valid: false,
      status: 'invalid_id',
      message: 'Identifiant introuvable dans la base des inscrits.',
    };
  }

  if (providedSignature) {
    const expectedSig = generateQrSignature(reg.id);
    if (providedSignature.toLowerCase() !== expectedSig.toLowerCase()) {
      return {
        valid: false,
        status: 'invalid_signature',
        message: 'Signature de sécurité invalide ou falsifiée.',
      };
    }
  }

  if (reg.checkedIn) {
    return {
      valid: false,
      status: 'already_scanned',
      registration: reg,
      message: `Badge déjà scanné le ${new Date(reg.checkedInAt || '').toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
    };
  }

  return {
    valid: true,
    status: 'valid',
    registration: reg,
    message: 'Badge valide et authentifié.',
  };
}

/**
 * DELETE REGISTRATION (ADMIN SEULEMENT)
 */
export async function deleteRegistration(id: string): Promise<boolean> {
  const db = getFirebaseDb();
  const cleanId = id.trim();
  if (db) {
    await deleteDoc(doc(db, FIRESTORE_COLLECTION, cleanId));
  }
  memoryRegistrations = memoryRegistrations.filter((r) => r.id.toLowerCase() !== cleanId.toLowerCase());
  window.dispatchEvent(new Event('jnum_registrations_updated'));
  return true;
}

/**
 * REAL-TIME COMPUTED STATS
 */
export function getRegistrationStats() {
  const all = memoryRegistrations;
  const checkedIn = all.filter((r) => r.checkedIn).length;
  const whatsappSent = all.filter((r) => r.whatsappStatus === 'sent' || r.whatsappStatus === 'delivered').length;
  const byCategory: Record<string, number> = {};
  all.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });

  return {
    totalRegistered: all.length,
    totalCheckedIn: checkedIn,
    checkInRate: all.length > 0 ? Math.round((checkedIn / all.length) * 100) : 0,
    whatsappSent,
    byCategory,
  };
}

/**
 * EXPORT CSV
 */
export function exportRegistrationsCsv(): void {
  const all = memoryRegistrations;
  const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Pays', 'Ville', 'Catégorie', 'Rôle', 'Organisation', 'Poste', 'Émargé', 'Date Inscription'];
  const rows = all.map((r) => [
    r.id,
    `"${r.firstName.replace(/"/g, '""')}"`,
    `"${r.lastName.replace(/"/g, '""')}"`,
    `"${(r.email || '').replace(/"/g, '""')}"`,
    `"${r.whatsappPhone || r.phoneNumber || ''}"`,
    `"${r.country}"`,
    `"${r.city}"`,
    `"${r.category}"`,
    `"${r.role}"`,
    `"${(r.organization || '').replace(/"/g, '""')}"`,
    `"${(r.jobTitle || '').replace(/"/g, '""')}"`,
    r.checkedIn ? 'Oui' : 'Non',
    r.createdAt,
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `jnum-2026-inscriptions-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * WHATSAPP DIRECT URL
 */
export function getWhatsAppDirectUrl(registration: Registration): string {
  const cleanPhone = registration.whatsappPhone.replace(/[^0-9]/g, '');
  const origin = typeof window !== 'undefined' ? window.location.origin : EVENT_CONFIG.social.domain;
  const badgePageUrl = `${origin}/badge/${registration.id}`;

  const messageText = 
    `Assalamou alaykoum ${registration.firstName} 🌙\n\n` +
    `Votre inscription à la JNUM – Journée Numérique Musulmane (${EVENT_CONFIG.edition}) est confirmée ✅\n\n` +
    `🎫 Votre Identifiant : *${registration.id}*\n` +
    `📅 Date : *${EVENT_CONFIG.dateDisplay} à ${EVENT_CONFIG.startTime}*\n` +
    `📍 Lieu : *${EVENT_CONFIG.venue.name}*\n` +
    `🗺️ Adresse : ${EVENT_CONFIG.venue.address}\n\n` +
    `📲 Retrouvez et téléchargez votre badge avec QR code sécurisé ici :\n${badgePageUrl}\n\n` +
    `Présentez votre QR code à l'accueil pour entrer.\nBarakallahou fik !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

// Fallback empty logs
export function getCheckInLogs(): CheckInLog[] {
  return [];
}
