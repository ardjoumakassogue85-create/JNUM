import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JnumLogo } from '../components/common/JnumLogo';
import { EVENT_CONFIG } from '../config/event';
import { INITIAL_SPEAKERS } from '../data/seedData';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Brain,
  TrendingUp,
  Video,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Navigation,
  Share2,
  Users,
  Award,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Live Countdown to Event Date
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(EVENT_CONFIG.isoStartDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "L'inscription à la JNUM est-elle payante ?",
      a: "Non, l'accès à la JNUM est entièrement gratuit pour tous les participants. Cependant, en raison de la capacité d'accueil limitée de l'IUA, Campus Bonoumin, l'inscription préalable en ligne est obligatoire pour obtenir votre badge officiel muni de QR code.",
    },
    {
      q: 'Comment vais-je recevoir mon badge participant ?',
      a: "Dès que vous validez votre formulaire d'inscription en ligne, votre badge nominatif en haute définition avec QR code unique est généré instantanément. Vous pouvez le télécharger en format PNG ou PDF, et vous le recevez également directement sur votre compte WhatsApp !",
    },
    {
      q: 'Les ateliers pratiques nécessitent-ils du matériel particulier ?',
      a: "Pour tirer le meilleur parti des ateliers hands-on (Atelier IA Générative et Atelier Hygiène Cyber), il est fortement recommandé d'apporter votre ordinateur portable ou votre tablette chargée. Le Wifi haut débit sécurisé sera disponible sur place.",
    },
    {
      q: 'Y aura-t-il des repas et un espace de prière aménagé ?',
      a: "Absolument. Un déjeuner convivial ainsi que des pauses rafraîchissements sont offerts à tous les participants inscrits. Deux salles de prière dédiées (femmes et hommes) avec espaces d'ablutions sont aménagées sur place pour les prières de Dhohr et d'Asr.",
    },
    {
      q: "Je viens d'une autre ville ou d'un autre pays, puis-je participer ?",
      a: "Oui, la JNUM accueille avec joie les participants de toutes les régions et de l'international. Les sessions plénières de l'amphithéâtre seront également retransmises en direct sur notre chaîne officielle pour les personnes à distance.",
    },
  ];

  const pillars = [
    {
      icon: Brain,
      title: 'Intelligence Artificielle & Éthique',
      desc: 'Comprendre l’impact des modèles de langage et de la vision par ordinateur, déjouer les biais algorithmiques et valoriser une tech humaniste.',
      color: 'bg-emerald-50 text-[#075B22] border-emerald-200',
    },
    {
      icon: Shield,
      title: 'Cybersécurité & Souveraineté',
      desc: 'Protéger ses données personnelles, sécuriser les applications de nos organisations et sensibiliser les familles face aux menaces numériques.',
      color: 'bg-orange-50 text-[#FF5A00] border-orange-200',
    },
    {
      icon: TrendingUp,
      title: 'Entrepreneuriat & Finance Inclusive',
      desc: 'Innover dans la Halal Tech, financer des projets à impact positif, structurer sa gouvernance et conquérir de nouveaux marchés régionaux.',
      color: 'bg-emerald-50 text-[#075B22] border-emerald-200',
    },
    {
      icon: Video,
      title: 'Jeunesse & Création de Contenu',
      desc: 'Former la nouvelle génération au storytelling digital d’excellence, à l’animation de communautés éthiques et à l’influence responsable.',
      color: 'bg-orange-50 text-[#FF5A00] border-orange-200',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 md:py-24 bg-gradient-to-b from-[#F7FAF7] via-white to-[#F7FAF7]">
        {/* Subtle Islamic Girih Pattern Backdrop */}
        <div className="absolute inset-0 bg-islamic-girih opacity-15 pointer-events-none" />

        {/* Decorative Sweeping Arcs & Tech Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-emerald-200/40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FF5A00]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#075B22]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#075B22]/10 border border-[#075B22]/20 text-[#075B22] text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-[#FF5A00]" />
              <span>{EVENT_CONFIG.edition} • Le Grand Rassemblement Tech & Éthique</span>
            </div>

            {/* Official Logo Display */}
            <div className="mb-6 flex flex-col items-center justify-center">
              <JnumLogo size="hero" />
              <p className="mt-2 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#075B22] bg-[#075B22]/10 px-4 py-1 rounded-full border border-[#075B22]/20 shadow-xs">
                By Sous-Comité 3 de Cocody
              </p>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 font-display tracking-tight leading-tight mt-2">
              Bâtir un Numérique <span className="text-[#075B22]">Innovant</span>,{' '}
              <span className="text-[#FF5A00]">Éthique</span> & Souverain
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl">
              Une journée immersive dédiée à l’Intelligence Artificielle, la cybersécurité, l’entrepreneuriat et la formation des talents de la communauté musulmane.
            </p>

            {/* Date, Location & Time Pill */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-neutral-700 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-neutral-200">
              <div className="flex items-center gap-2 text-[#075B22]">
                <Calendar className="w-4 h-4 text-[#FF5A00]" />
                <span>{EVENT_CONFIG.dateDisplay}</span>
              </div>
              <span className="hidden sm:inline text-neutral-300">•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{EVENT_CONFIG.startTime} – {EVENT_CONFIG.endTime}</span>
              </div>
              <span className="hidden sm:inline text-neutral-300">•</span>
              <div className="flex items-center gap-2 text-neutral-800">
                <MapPin className="w-4 h-4 text-[#075B22]" />
                <span>{EVENT_CONFIG.venue.name}</span>
              </div>
            </div>

            {/* Live Countdown Box */}
            <div className="mt-8 w-full max-w-lg bg-gradient-to-r from-[#075B22] to-[#0A3D18] text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-emerald-700/50">
              <p className="text-xs uppercase font-bold tracking-widest text-[#FF5A00] mb-3">
                Compte à rebours avant le grand jour
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-black/30 rounded-xl p-2 sm:p-2.5">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-white">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-200 uppercase font-semibold">Jours</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 sm:p-2.5">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-200 uppercase font-semibold">Heures</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 sm:p-2.5">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-200 uppercase font-semibold">Min</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 sm:p-2.5">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-[#FF5A00]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-200 uppercase font-semibold">Sec</span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/inscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF5A00] hover:bg-[#E04E00] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-[#FF5A00]/25 hover:shadow-2xl hover:shadow-[#FF5A00]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Je m'inscris gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/programme"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-neutral-50 text-[#075B22] font-bold text-base rounded-2xl border-2 border-[#075B22] shadow-sm hover:shadow transition-all"
              >
                <span>Découvrir le programme</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CHIFFRES CLÉS ANIMÉS */}
      <section className="py-12 bg-[#075B22] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-islamic-girih opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight">
                300<span className="text-[#FF5A00]">+</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1 uppercase tracking-wider">
                Participants attendus
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight">
                10<span className="text-[#FF5A00]">+</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1 uppercase tracking-wider">
                Intervenants & Experts
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight">
                5
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1 uppercase tracking-wider">
                Sessions & Ateliers Pratiques
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-[#FF5A00] tracking-tight">
                100%
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1 uppercase tracking-wider">
                Gratuit sur Inscription
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THÉMATIQUES MAJEURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
              Piliers de la Journée
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display mt-2">
              Quatre axes stratégiques pour façonner le futur
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              Des conférences inspirantes et des ateliers concrets pour monter en compétences et impacter positivement la société.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 bg-white ${item.color.includes('orange') ? 'border-orange-200' : 'border-emerald-200'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TEMPS FORTS & EXPÉRIENCES */}
      <section className="py-16 bg-[#F7FAF7] border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#075B22]">
                Pourquoi Participer ?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display mt-2 leading-tight">
                Une journée d’apprentissage, de réseau et d’opportunités professionnelles
              </h2>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                La JNUM réunit des étudiants, développeurs, ingénieurs, chefs d'entreprise et passionnés pour échanger sans filtre sur les grands enjeux technologiques de demain.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-[#075B22] mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Ateliers pratiques sur PC</h4>
                    <p className="text-xs text-neutral-600">Manipulation réelle d’outils d’IA, hardening cybersécurité et création de contenu de A à Z.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-orange-100 text-[#FF5A00] mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Espace Networking & Recrutement</h4>
                    <p className="text-xs text-neutral-600">Rencontrez des recruteurs tech, des fondateurs de startups et de futurs collaborateurs pour vos projets.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-[#075B22] mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Badge Numérique & QR Code Sécurisé</h4>
                    <p className="text-xs text-neutral-600">Génération automatique de votre pass d'entrée officiel avec suivi sur WhatsApp.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/programme"
                  className="inline-flex items-center gap-2 font-bold text-sm text-[#075B22] hover:text-[#FF5A00] transition-colors"
                >
                  <span>Explorer le déroulé complet de la journée</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* High Tech Card with Visual Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-tr from-[#075B22] to-[#1B8A3A] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A00]/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">
                      Expérience Immersive
                    </span>
                    <Award className="w-6 h-6 text-[#FF5A00]" />
                  </div>

                  <h3 className="font-display font-extrabold text-2xl text-white mb-4">
                    « Quand l'excellence numérique s'harmonise avec l'éthique »
                  </h3>

                  <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                    Venez vivre des démonstrations en direct, poser vos questions à des experts renommés et bâtir des projets qui ont du sens pour la communauté.
                  </p>

                  <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="block text-xs text-emerald-200">Date officielle</span>
                      <span className="font-bold text-sm text-white">{EVENT_CONFIG.dateDisplay}</span>
                    </div>
                    <Link
                      to="/inscription"
                      className="px-4 py-2 bg-[#FF5A00] hover:bg-[#E04E00] text-white text-xs font-bold rounded-xl shadow transition-all"
                    >
                      Réserver ma place
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERVENANTS À LA UNE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
                Experts & Leaders d'Opinion
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display mt-2">
                Les intervenants de renom
              </h2>
            </div>
            <Link
              to="/intervenants"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 font-bold text-sm text-[#075B22] hover:text-[#FF5A00] transition-colors"
            >
              <span>Voir tous les intervenants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INITIAL_SPEAKERS.slice(0, 4).map((speaker) => (
              <div
                key={speaker.id}
                className="group bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-[#075B22] transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-neutral-200">
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.fullName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#075B22] text-white text-[10px] font-bold rounded-md">
                      Expert
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-neutral-900 group-hover:text-[#075B22] transition-colors">
                    {speaker.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-[#FF5A00] mt-0.5">
                    {speaker.title}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    {speaker.organization}
                  </p>
                  <p className="text-xs text-neutral-600 mt-3 line-clamp-3 leading-relaxed">
                    {speaker.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Intervenant JNUM</span>
                  <Link
                    to="/intervenants"
                    className="text-[#075B22] font-bold hover:underline"
                  >
                    Profil complet →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INFOS PRATIQUES & PLAN D'ACCÈS */}
      <section id="infos" className="py-20 bg-[#F7FAF7] border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#075B22]">
              Organisation & Logistique
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display mt-2">
              Informations pratiques & Accès
            </h2>
            <p className="mt-4 text-neutral-600 text-sm">
              Tout ce dont vous avez besoin pour préparer sereinement votre venue à la JNUM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Practical Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075B22] flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-neutral-900 mb-2">
                Lieu de l'événement
              </h3>
              <p className="text-sm font-semibold text-neutral-800">
                {EVENT_CONFIG.venue.name}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                {EVENT_CONFIG.venue.address}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {EVENT_CONFIG.venue.hall}
              </p>
              <div className="mt-4">
                <a
                  href={EVENT_CONFIG.venue.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A00] hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Ouvrir sur Google Maps</span>
                </a>
              </div>
            </div>

            {/* Practical Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A00] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-neutral-900 mb-2">
                Horaires & Déroulement
              </h3>
              <p className="text-sm font-semibold text-neutral-800">
                {EVENT_CONFIG.dateDisplay}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Ouverture des portes & Émargement : <strong>08h00</strong>
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Cérémonie d'ouverture : <strong>08h30</strong>
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Clôture : <strong>18h00</strong>
              </p>
            </div>

            {/* Practical Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075B22] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-neutral-900 mb-2">
                Services & Confort sur place
              </h3>
              <ul className="space-y-1.5 text-xs text-neutral-600">
                <li>• Wifi haut débit gratuit sur toute la zone</li>
                <li>• Espace prière aménagé avec ablutions</li>
                <li>• Déjeuner offert aux inscrits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDÉON */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
              Questions Fréquentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display mt-2">
              Tout savoir avant de venir
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-2xl overflow-hidden transition-all bg-[#F7FAF7]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-neutral-900 hover:text-[#075B22] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#FF5A00]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. PARTENAIRES & SPONSORS
       <section className="py-14 bg-[#F7FAF7] border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-8">
            Avec le soutien de nos partenaires académiques et technologiques
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
            <span className="font-display font-extrabold text-xl text-neutral-800 tracking-tight">
              TechWomen Africa
            </span>
            <span className="font-display font-extrabold text-xl text-neutral-800 tracking-tight">
              Barakah Venture
            </span>
            <span className="font-display font-extrabold text-xl text-neutral-800 tracking-tight">
              OpenCloud Academy
            </span>
            <span className="font-display font-extrabold text-xl text-neutral-800 tracking-tight">
              Institut Al-Khawarizmi
            </span>
            <span className="font-display font-extrabold text-xl text-neutral-800 tracking-tight">
              Hikma Digital Media
            </span>
          </div>
        </div>
      </section> */}

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-[#075B22] via-[#0b6623] to-[#075B22] text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-islamic-girih opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-6 inline-block">
            Places Gratuites & Limitées
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            Réservez Votre Badge Participant Maintenant
          </h2>
          <p className="mt-4 text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto">
            Rejoignez plus de 300 esprits brillants pour vivre la 1ère édition de la Journée Numérique Musulmane.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/inscription"
              className="w-full sm:w-auto px-9 py-4 bg-[#FF5A00] hover:bg-[#E04E00] text-white font-extrabold text-base rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Je m'inscris gratuitement
            </Link>
            <Link
              to="/programme"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-base rounded-2xl border border-emerald-500/50 transition-all"
            >
              Consulter l'agenda
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
