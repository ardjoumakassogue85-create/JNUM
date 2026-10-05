import { Session, Speaker } from '../types';
import { INITIAL_SESSIONS, INITIAL_SPEAKERS } from '../data/seedData';
import { EVENT_CONFIG } from '../config/event';

const SESSIONS_STORAGE_KEY = 'jnum_sessions_v3';
const SPEAKERS_STORAGE_KEY = 'jnum_speakers_v3';
const FAVORITES_STORAGE_KEY = 'jnum_user_favorites_v2';

export function getAllSessions(): Session[] {
  try {
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveAllSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event('jnum_sessions_updated'));
}

export function getAllSpeakers(): Speaker[] {
  try {
    const stored = localStorage.getItem(SPEAKERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(SPEAKERS_STORAGE_KEY, JSON.stringify(INITIAL_SPEAKERS));
      return INITIAL_SPEAKERS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_SPEAKERS;
  }
}

export function saveAllSpeakers(speakers: Speaker[]): void {
  localStorage.setItem(SPEAKERS_STORAGE_KEY, JSON.stringify(speakers));
  window.dispatchEvent(new Event('jnum_speakers_updated'));
}

export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteSession(sessionId: string): string[] {
  const current = getFavorites();
  const exists = current.includes(sessionId);
  const updated = exists ? current.filter((id) => id !== sessionId) : [...current, sessionId];
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('jnum_favorites_updated'));
  return updated;
}

// Compute real-time status: "En cours" | "À suivre" | "Terminé" | "À venir"
export function getSessionLiveStatus(
  session: Session,
  testTime?: Date
): 'current' | 'next' | 'finished' | 'upcoming' {
  const now = testTime || new Date();
  
  // Parse session times on event day
  // Assuming today is event day or checking relative time
  const [startHour, startMin] = session.startTime.split(':').map(Number);
  const [endHour, endMin] = session.endTime.split(':').map(Number);

  const start = new Date(now);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, endMin, 0, 0);

  if (now >= start && now <= end) {
    return 'current';
  } else if (now < start) {
    const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 45 ? 'next' : 'upcoming';
  } else {
    return 'finished';
  }
}

// Generate Google Calendar Link
export function getGoogleCalendarUrl(session?: Session): string {
  if (!session) {
    // Full event calendar link
    const title = encodeURIComponent(`${EVENT_CONFIG.name} (${EVENT_CONFIG.edition})`);
    const details = encodeURIComponent(
      `${EVENT_CONFIG.tagline}\n\nProgramme complet, ateliers et conférences tech éthique.\nSite officiel: ${EVENT_CONFIG.social.domain}`
    );
    const location = encodeURIComponent(`${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`);
    // 20261024T083000Z/20261024T190000Z
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=20261024T083000Z/20261024T190000Z`;
  }

  const title = encodeURIComponent(`[JNUM] ${session.title}`);
  const details = encodeURIComponent(
    `${session.description}\n\nLieu: ${EVENT_CONFIG.venue.name}\nThématique: ${session.theme}`
  );
  const location = encodeURIComponent(`${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`);
  const [sh, sm] = session.startTime.split(':');
  const [eh, em] = session.endTime.split(':');
  const startDateStr = `20261024T${sh.padStart(2, '0')}${sm.padStart(2, '0')}00Z`;
  const endDateStr = `20261024T${eh.padStart(2, '0')}${em.padStart(2, '0')}00Z`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDateStr}/${endDateStr}`;
}

// Download .ics file
export function downloadIcsFile(session?: Session): void {
  let icsContent = '';
  if (!session) {
    icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JNUM//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:jnum-2026-main@jnum-event.org',
      'DTSTAMP:20260101T000000Z',
      'DTSTART:20261024T083000Z',
      'DTEND:20261024T190000Z',
      `SUMMARY:${EVENT_CONFIG.name} - ${EVENT_CONFIG.edition}`,
      `DESCRIPTION:${EVENT_CONFIG.tagline}. Site web: ${EVENT_CONFIG.social.domain}`,
      `LOCATION:${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  } else {
    const [sh, sm] = session.startTime.split(':');
    const [eh, em] = session.endTime.split(':');
    const startDateStr = `20261024T${sh.padStart(2, '0')}${sm.padStart(2, '0')}00Z`;
    const endDateStr = `20261024T${eh.padStart(2, '0')}${em.padStart(2, '0')}00Z`;

    icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JNUM//FR',
      'BEGIN:VEVENT',
      `UID:${session.id}@jnum-event.org`,
      'DTSTAMP:20260101T000000Z',
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:[JNUM] ${session.title}`,
      `DESCRIPTION:${session.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', session ? `jnum-session-${session.id}.ics` : 'jnum-2026-agenda.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
