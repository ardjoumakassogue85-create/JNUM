import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRegistrationById } from '../services/registrationService';
import { Registration } from '../types';
import { ParticipantBadge } from '../components/badge/ParticipantBadge';
import { EVENT_CONFIG } from '../config/event';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const PublicBadgePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const reg = getRegistrationById(id);
      setRegistration(reg);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#075B22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-neutral-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#FF5A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-display text-neutral-900">
            Badge Introuvable
          </h2>
          <p className="text-xs text-neutral-600 mt-2">
            Ce badge participant n'existe pas ou le lien est expiré.
          </p>
          <Link
            to="/inscription"
            className="mt-6 inline-block px-5 py-2.5 bg-[#075B22] text-white text-xs font-bold rounded-xl"
          >
            S'inscrire à l'événement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-10 md:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Verification Status Pill */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-[#075B22] text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Badge Officiel Vérifié • {EVENT_CONFIG.edition}</span>
          </div>
        </div>

        {/* Badge Component */}
        <ParticipantBadge registration={registration} showActions={true} />

        {/* Check-in Info */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-neutral-200 text-center shadow-sm">
          <p className="text-xs text-neutral-600">
            {registration.checkedIn ? (
              <span className="text-emerald-700 font-bold">
                ✓ Participant déjà émargé le {registration.checkedInAt ? new Date(registration.checkedInAt).toLocaleTimeString('fr-FR') : ''}
              </span>
            ) : (
              <span className="text-neutral-500 font-medium">
                Statut : Non émargé • Présentez ce QR à l'accueil le jour de l'événement
              </span>
            )}
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-bold text-[#075B22] hover:text-[#FF5A00] inline-flex items-center gap-1"
          >
            <span>Découvrir le site officiel JNUM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
