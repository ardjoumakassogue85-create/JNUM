import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRegistrationById } from '../services/registrationService';
import { Registration } from '../types';
import { ParticipantBadge } from '../components/badge/ParticipantBadge';
import { EVENT_CONFIG } from '../config/event';
import { downloadIcsFile, getGoogleCalendarUrl } from '../services/sessionService';
import {
  CheckCircle,
  MessageCircle,
  Calendar,
  MapPin,
  Share2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Download,
} from 'lucide-react';

export const ConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRegistration() {
      if (id) {
        const reg = await fetchRegistrationById(id);
        if (isMounted) {
          setRegistration(reg);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }
    loadRegistration();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#075B22] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-neutral-700">Chargement de votre confirmation...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-neutral-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#FF5A00] mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-neutral-900">
            Inscription introuvable
          </h2>
          <p className="text-xs text-neutral-600 mt-2">
            Aucun enregistrement ne correspond à l'identifiant renseigné.
          </p>
          <Link
            to="/inscription"
            className="mt-6 inline-block px-5 py-2.5 bg-[#075B22] text-white text-xs font-bold rounded-xl"
          >
            S'inscrire à nouveau
          </Link>
        </div>
      </div>
    );
  }

  // Pre-filled WhatsApp message for user
  const phone = registration.phoneNumber || registration.whatsappPhone || '';
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Salam alaykum ${registration.firstName} ! Voici votre badge officiel pour la ${EVENT_CONFIG.name} (${EVENT_CONFIG.edition}).\n\nIdentifiant : ${registration.id}\nLien direct de vérification : ${registration.qrVerificationUrl}\n\nRendez-vous le ${EVENT_CONFIG.dateDisplay} à ${EVENT_CONFIG.venue.name} !`
  )}`;

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Success Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm mb-8 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-100 text-[#075B22] rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle className="w-8 h-8" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
            Inscription Validée avec Succès
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 font-display mt-1">
            Félicitations, {registration.firstName} !
          </h1>
          <p className="text-xs sm:text-base text-neutral-600 mt-2 max-w-xl mx-auto">
            Votre place est officiellement réservée pour la <strong>{EVENT_CONFIG.name}</strong>. Voici votre badge nominatif muni de son QR code unique.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-lg text-xs font-mono font-bold text-neutral-800">
            <span>Pass n° : {registration.id}</span>
          </div>
        </div>

        {/* Badge Card & Actions */}
        <div className="mb-10">
          <ParticipantBadge registration={registration} showActions={true} />
        </div>

        {/* WhatsApp Notification & Delivery Card */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#075B22] text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Envoi WhatsApp Automatique</span>
              </div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                Votre badge sur votre WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-md">
                Un message avec votre pass officiel a été préparé pour le numéro <strong>{phone}</strong>.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 shrink-0"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Ouvrir dans WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Event Quick Info & Calendar Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Card 1: Agenda */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075B22] flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">
                Ne manquez pas l'événement
              </h4>
              <p className="text-xs text-neutral-600 mt-1">
                {EVENT_CONFIG.dateDisplay} • Accueil dès {EVENT_CONFIG.startTime}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
              <button
                onClick={() => downloadIcsFile()}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold"
              >
                Fichier .ics
              </button>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#075B22] rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <span>Google Agenda</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Venue */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5A00] flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">
                Localisation de la salle
              </h4>
              <p className="text-xs text-neutral-600 mt-1">
                {EVENT_CONFIG.venue.name} • {EVENT_CONFIG.venue.address}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100">
              <a
                href={EVENT_CONFIG.venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A00] hover:underline"
              >
                <span>Itinéraire Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center space-x-4">
          <Link
            to="/programme"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#075B22] hover:underline"
          >
            <span>Consulter le programme détaillé</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:underline"
          >
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
