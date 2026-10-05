import { Registration, RegistrationFormData, CheckInLog } from '../types';
import { EVENT_CONFIG } from '../config/event';
import { DEMO_REGISTRATIONS } from '../data/seedData';

const STORAGE_KEY = 'jnum_registrations_v2';
const CHECKIN_LOGS_KEY = 'jnum_checkin_logs_v2';

// Simple HMAC-like deterministic hash signature generator for offline & online verification
export function generateQrSignature(id: string, secret: string = EVENT_CONFIG.security.hmacSecret): string {
  let hash = 0;
  const combined = `${id}:${secret}:jnum2026`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to clean hex string
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
  // Exclude ambiguous characters like 0, O, 1, I, L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }
  return `JNUM-${EVENT_CONFIG.year}-${randomPart}`;
}

// Load registrations from storage or seed
export function getAllRegistrations(): Registration[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_REGISTRATIONS));
      return DEMO_REGISTRATIONS;
    }
    return JSON.parse(stored);
  } catch {
    return DEMO_REGISTRATIONS;
  }
}

export function saveAllRegistrations(registrations: Registration[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    // Dispatch custom event for real-time reactive sync across components
    window.dispatchEvent(new Event('jnum_registrations_updated'));
  } catch (err) {
    console.error('Failed to save registrations', err);
  }
}

export function getRegistrationById(id: string): Registration | null {
  const all = getAllRegistrations();
  return all.find((r) => r.id.toLowerCase() === id.trim().toLowerCase()) || null;
}

export function checkDuplicate(email?: string, phone?: string): { isDuplicate: boolean; field?: 'email' | 'phone' } {
  const all = getAllRegistrations();
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  if (cleanEmail && cleanEmail.length > 0) {
    const duplicateEmail = all.find((r) => r.email && r.email.trim().toLowerCase() === cleanEmail);
    if (duplicateEmail) {
      return { isDuplicate: true, field: 'email' };
    }
  }

  if (cleanPhone) {
    const duplicatePhone = all.find((r) => r.whatsappPhone.replace(/[^0-9]/g, '') === cleanPhone);
    if (duplicatePhone) {
      return { isDuplicate: true, field: 'phone' };
    }
  }

  return { isDuplicate: false };
}

// Create new registration
export async function createRegistration(data: RegistrationFormData): Promise<Registration> {
  const duplicate = checkDuplicate(data.email, data.phoneNumber);
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
  const cleanEmail = data.email?.trim().toLowerCase();

  const newReg: Registration = {
    id,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: cleanEmail || '',
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
    workshopIds: data.workshopIds,
    consentData: data.consentData,
    consentWhatsapp: data.consentWhatsapp,
    createdAt: new Date().toISOString(),
    qrSignature: signature,
    qrVerificationUrl,
    whatsappStatus: 'pending',
    checkedIn: false,
  };

  const existing = getAllRegistrations();
  existing.unshift(newReg);
  saveAllRegistrations(existing);

  return newReg;
}

// Update registration fields
export function updateRegistration(id: string, updates: Partial<Registration>): Registration | null {
  const all = getAllRegistrations();
  const index = all.findIndex((r) => r.id.toLowerCase() === id.trim().toLowerCase());
  if (index === -1) return null;

  all[index] = { ...all[index], ...updates };
  saveAllRegistrations(all);
  return all[index];
}

export function updateRegistrationStatus(id: string, updates: Partial<Registration>): Registration | null {
  return updateRegistration(id, updates);
}

export function getRegistrationStats() {
  const all = getAllRegistrations();
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

export function exportRegistrationsCsv(): void {
  const all = getAllRegistrations();
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

// Delete registration
export function deleteRegistration(id: string): boolean {
  const all = getAllRegistrations();
  const filtered = all.filter((r) => r.id.toLowerCase() !== id.trim().toLowerCase());
  if (filtered.length === all.length) return false;
  saveAllRegistrations(filtered);
  return true;
}

// Generate Mode B WhatsApp direct link
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

// Verification function for Check-in / Scanner & Public Verify
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

  // If signature provided, verify it
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

// Perform Check-in
export function checkInParticipant(id: string, scannedBy: string = 'Staff JNUM'): { success: boolean; registration?: Registration; message: string } {
  const reg = getRegistrationById(id);
  if (!reg) {
    return { success: false, message: 'Participant introuvable.' };
  }

  if (reg.checkedIn) {
    return { 
      success: false, 
      registration: reg, 
      message: `Déjà enregistré à l'entrée à ${new Date(reg.checkedInAt || '').toLocaleTimeString('fr-FR')}` 
    };
  }

  const updated = updateRegistration(id, {
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    checkedInBy: scannedBy,
  });

  // Log checkin
  const logs = getCheckInLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    registrationId: reg.id,
    participantName: `${reg.firstName} ${reg.lastName}`,
    category: reg.category,
    role: reg.role,
    scannedAt: new Date().toISOString(),
    scannedBy,
    status: 'valid',
  });
  localStorage.setItem(CHECKIN_LOGS_KEY, JSON.stringify(logs));

  return { success: true, registration: updated || reg, message: 'Entrée confirmée avec succès !' };
}

export function getCheckInLogs(): CheckInLog[] {
  try {
    const stored = localStorage.getItem(CHECKIN_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
