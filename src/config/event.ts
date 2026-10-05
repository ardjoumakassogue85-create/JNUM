/**
 * CONFIGURATION OFFICIELLE - JOURNÉE NUMÉRIQUE MUSULMANE (JNUM)
 * Toutes les informations modifiables sont centralisées ici.
 * Les valeurs à adapter pour votre environnement sont marquées [À REMPLACER].
 */

export const EVENT_CONFIG = {
  // Informations Générales
  name: "Journée Numérique Musulmane",
  shortName: "JNUM",
  acronym: "JNUM",
  edition: "1ère Édition 2026",
  year: 2026,
  tagline: "L'écosystème numérique au service d'un avenir éthique et innovant",
  subtitle: "IA • Cybersécurité • Entrepreneuriat • Création de Contenu • Éthique",

  // Dates et Horaires
  dateDisplay: "Samedi 17 Octobre 2026",
  startTime: "08:00",
  endTime: "18:00",
  isoStartDate: "2026-10-17T08:00:00+00:00",
  isoEndDate: "2026-10-17T18:00:00+00:00",
  timezone: "Africa/Abidjan", // [À REMPLACER: ex. Europe/Paris ou Africa/Abidjan]
  registrationDeadline: "2026-10-15T16:59:59+00:00",

  // Lieu & Accès
  venue: {
    name: "IUA, Campus Bonoumin",
    hall: "Salle de conférence du campus",
    address: "Cocody Bonoumin, campus vitré",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    googleMapsUrl: "https://maps.app.goo.gl/nRLYKjJwFmvPEznFA",
    coordinates: {
      lat: 5.3582,
      lng: -3.9856,
    },
    transport: {
      metroRer: "Cocody Bonoumin — Voie d'accès principale, taxis & transports",
    },
  },

  // Capacité et Inscription
  capacity: {
    maxParticipants: 300,
    currentRegisteredEstimate: 0,
    workshopSeatsDefault: 40,
  },

  // Contact & Réseaux
  contact: {
    email: "Cocody3aeemci@gmail.com", // [À REMPLACER]
    whatsapp: "+2250586659138", // [À REMPLACER: numéro international avec indicatif sans + pour wa.me]
    whatsappDisplay: "+225 05 86 65 91 38", // [À REMPLACER]
    phone: "+225 05 86 65 91 38", // [À REMPLACER]
    organizer: "Sous-Comité 3 de Cocody", // [À REMPLACER]
    pressEmail: "presse@jnum-event.org", // [À REMPLACER]
  },

  // Réseaux Sociaux & Liens
  social: {
    twitter: "https://x.com/jnum_officiel", // [À REMPLACER]
    linkedin: "https://linkedin.com/company/jnum-event", // [À REMPLACER]
    instagram: "https://instagram.com/jnum_officiel", // [À REMPLACER]
    youtube: "https://youtube.com/@jnum_event", // [À REMPLACER]
    whatsappChannel: "https://chat.whatsapp.com/JNUM2026Community", // [À REMPLACER]
    domain: "https://jnum-event.org", // [À REMPLACER: domaine officiel de production]
  },

  // Configuration Téléphonique & Localisation
  phone: {
    defaultCountryCode: "+225", // [À REMPLACER: ex. +225 pour la Côte d'Ivoire, +33 pour la France]
    defaultCountryAlpha2: "CI", // [À REMPLACER: ex. CI ou FR]
  },

  // Hashtags officiels
  hashtags: [
    "#JNUM2026",
    "#TechEthique",
    "#MuslimInTech",
    "#IAEthique",
    "#DigitalMuslim",
    "#CyberSecurite",
  ],

  // Sécurité QR & Signatures
  security: {
    hmacSecret: "JNUM_SECRET_HMAC_KEY_2026_PRODUCTION", // [À REMPLACER dans variables d'environnement]
    qrPrefix: "https://jnum-event.org/verify/",
  },

  // WhatsApp Cloud API
  whatsappApi: {
    templateName: "jnum_badge_participant",
    templateLang: "fr",
    category: "UTILITY",
  },
};
