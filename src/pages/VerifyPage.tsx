import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  getRegistrationById,
  verifyQrSignature,
  checkInParticipant,
} from '../services/registrationService';
import { Registration } from '../types';
import { EVENT_CONFIG } from '../config/event';
import { WORKSHOPS_CATALOG } from '../data/seedData';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  MapPin,
  Building,
  Briefcase,
  ArrowRight,
  QrCode,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t') || '';

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isValidSignature, setIsValidSignature] = useState<boolean | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Verify cryptographic signature
    const valid = verifyQrSignature(id, token);
    setIsValidSignature(valid);

    const reg = getRegistrationById(id);
    setRegistration(reg);
  }, [id, token]);

  const handlePerformCheckIn = async () => {
    if (!id) return;
    setIsProcessing(true);
    const result = await checkInParticipant(id, 'Agent Accueil 1');
    setIsProcessing(false);

    if (result.success && result.registration) {
      setRegistration(result.registration);
      setCheckInSuccess(true);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  if (isValidSignature === null) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#075B22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Cryptographic Signature Failed or Tampered
  if (!isValidSignature) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-2 border-red-300 shadow-lg">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold font-display text-neutral-900">
            Signature Numérique Invalide
          </h2>
          <p className="text-xs text-neutral-600 mt-2">
            Ce QR code présente une signature cryptographique invalide ou altérée. L'accès ne peut pas être validé.
          </p>
          <div className="mt-6">
            <Link
              to="/admin/scan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 text-white text-xs font-bold rounded-xl"
            >
              <span>Retour au scanner d'entrée</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-neutral-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#FF5A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-display text-neutral-900">
            Participant Inconnu
          </h2>
          <p className="text-xs text-neutral-600 mt-2">
            Aucun enregistrement ne correspond au matricule {id}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-10 md:py-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        {/* Verification Status Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-md mb-6 text-center ${
            registration.checkedIn
              ? 'bg-amber-50 border-amber-300'
              : 'bg-white border-emerald-300'
          }`}
        >
          {registration.checkedIn ? (
            <div>
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                Déjà Émargé
              </span>
              <h2 className="text-2xl font-black font-display text-neutral-900 mt-1">
                Badge Déjà Utilisé
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Émargement effectué le{' '}
                <strong>
                  {registration.checkedInAt
                    ? new Date(registration.checkedInAt).toLocaleString('fr-FR')
                    : 'Aujourd\'hui'}
                </strong>
              </p>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 bg-emerald-100 text-[#075B22] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#075B22]">
                Pass Authentique Vérifié
              </span>
              <h2 className="text-2xl font-black font-display text-neutral-900 mt-1">
                Accès Autorisé
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Signature HMAC cryptographiquement valide.
              </p>
            </div>
          )}
        </div>

        {/* Participant Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Matricule
              </span>
              <p className="font-mono text-base font-black text-neutral-900">
                {registration.id}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#075B22] text-white text-xs font-extrabold rounded-full">
              {registration.role}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black font-display text-neutral-900">
              {registration.firstName} {registration.lastName}
            </h3>
            <p className="text-xs font-semibold text-[#FF5A00] mt-0.5">
              {registration.jobTitle} • {registration.organization}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {registration.city}, {registration.country}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-100">
            <div>
              <span className="text-neutral-400 font-medium">Catégorie :</span>
              <p className="font-bold text-neutral-800">{registration.category}</p>
            </div>
            <div>
              <span className="text-neutral-400 font-medium">Téléphone :</span>
              <p className="font-bold text-neutral-800">{registration.phoneNumber}</p>
            </div>
          </div>

          {registration.workshopIds.length > 0 && (
            <div className="pt-2 border-t border-neutral-100 text-xs">
              <span className="text-neutral-400 font-medium">Atelier choisi :</span>
              <p className="font-bold text-neutral-800 mt-0.5">
                {registration.workshopIds
                  .map((wsId) => {
                    const found = WORKSHOPS_CATALOG.find((w) => w.id === wsId);
                    return found ? `${found.icon} ${found.title}` : wsId;
                  })
                  .join(', ')}
              </p>
            </div>
          )}

          {/* Action Check-in Button */}
          {!registration.checkedIn ? (
            <div className="pt-4">
              <button
                onClick={handlePerformCheckIn}
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#075B22] hover:bg-[#064e1d] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Valider l'Émargement / Entrée</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
              ✓ Émargement déjà enregistré
            </div>
          )}

          {message && (
            <p className="text-xs text-center font-bold text-[#075B22] animate-bounce">
              {message}
            </p>
          )}
        </div>

        {/* Scanner Shortcut */}
        <div className="mt-6 text-center">
          <Link
            to="/admin/scan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#075B22]"
          >
            <QrCode className="w-4 h-4 text-[#FF5A00]" />
            <span>Continuer à scanner d'autres badges</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
