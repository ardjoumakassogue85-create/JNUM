export type ParticipantCategory = 
  | 'Étudiant'
  | 'Professionnel'
  | 'Entrepreneur'
  | 'Enseignant'
  | 'Association'
  | 'Autre';

export type BadgeRole = 
  | 'Participant'
  | 'Intervenant'
  | 'Organisateur'
  | 'VIP'
  | 'Presse'
  | 'Staff';

export type WhatsAppStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface Registration {
  id: string; // ex. "JNUM-2026-X7K9P2"
  firstName: string;
  lastName: string;
  email?: string;
  whatsappPhone: string;
  phoneNumber?: string; // convenient alias
  country: string;
  city: string;
  category: ParticipantCategory;
  role: BadgeRole;
  organization: string;
  jobTitle: string;
  interests: string[];
  referralSource: string;
  workshopIds: string[];
  consentData: boolean;
  consentWhatsapp: boolean;
  createdAt: string;
  qrSignature: string;
  qrVerificationUrl: string;
  badgeUrl?: string;
  whatsappStatus: WhatsAppStatus;
  whatsappAttempts?: number;
  lastWhatsappAttempt?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  notes?: string;
}

export interface RegistrationFormData {
  // Step 1: Identité
  firstName: string;
  lastName: string;
  email?: string;
  phoneCountryCode: string;
  phoneNumber: string;
  
  // Step 2: Profil
  country: string;
  city: string;
  category: ParticipantCategory;
  organization: string;
  jobTitle: string;
  interests: string[];
  referralSource: string;

  // Step 3: Ateliers & Consentement
  workshopIds: string[];
  consentData: boolean;
  consentWhatsapp: boolean;
  honeypot?: string;
}

export type SessionType = 
  | 'Accueil'
  | 'Ouverture'
  | 'Keynote'
  | 'Conférence'
  | 'Panel'
  | 'Atelier'
  | 'Pause'
  | 'Prière'
  | 'Networking'
  | 'Clôture';

export type SessionLevel = 'Tous niveaux' | 'Débutant' | 'Intermédiaire' | 'Avancé';

export interface WorkshopDetails {
  icon: string;
  shortTitle: string;
  theme: string;
  keyPoints: string[];
  finalProject: string;
}

export interface Session {
  id: string;
  day: number; // 1
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  title: string;
  description: string;
  type: SessionType;
  theme: string;
  room: string;
  speakerIds: string[];
  level: SessionLevel;
  maxSeats?: number;
  registeredCount?: number;
  isSpecialPause?: boolean; // True for prayer and lunch breaks
  isParallelWorkshops?: boolean; // True for the 2 simultaneous workshop slots
  parallelWorkshops?: {
    id: string;
    title: string;
    icon: string;
    room: string;
    theme: string;
    keyPoints: string[];
    finalProject: string;
  }[];
  workshopDetails?: WorkshopDetails;
}

export interface Speaker {
  id: string;
  fullName: string;
  title: string;
  organization: string;
  bio: string;
  photoUrl: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  sessionIds: string[];
  isFeatured?: boolean;
}

export interface RegistrationStats {
  totalRegistered: number;
  totalCheckedIn: number;
  checkInRate: number;
  whatsappSent: number;
  byCategory: Record<string, number>;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
}

export interface CheckInLog {
  id: string;
  registrationId: string;
  participantName: string;
  category: ParticipantCategory;
  role: BadgeRole;
  scannedAt: string;
  scannedBy: string;
  status: 'valid' | 'already_scanned' | 'invalid';
}

export interface EventStats {
  totalRegistrations: number;
  maxCapacity: number;
  occupancyRate: number;
  checkedInCount: number;
  whatsappDeliveredCount: number;
  whatsappPendingCount: number;
  whatsappFailedCount: number;
  categoryDistribution: Record<ParticipantCategory, number>;
  cityDistribution: Record<string, number>;
  timeline: { date: string; count: number }[];
}
