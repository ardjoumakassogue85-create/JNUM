import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Registration, BadgeRole } from '../../types';
import { EVENT_CONFIG } from '../../config/event';
import { JnumLogo } from '../common/JnumLogo';
import { Download, FileText, Share2, Check, Printer } from 'lucide-react';

interface ParticipantBadgeProps {
  registration: Registration;
  showActions?: boolean;
  onDownloaded?: () => void;
}

export const ParticipantBadge: React.FC<ParticipantBadgeProps> = ({
  registration,
  showActions = true,
  onDownloaded,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Generate high-resolution QR Code
  useEffect(() => {
    async function generateQr() {
      try {
        const url = registration.qrVerificationUrl;
        const dataUrl = await QRCode.toDataURL(url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 480,
          color: {
            dark: '#075B22', // Deep green modules
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code', err);
      }
    }
    generateQr();
  }, [registration.qrVerificationUrl]);

  // Role Badge Styling Colors
  const roleColors: Record<BadgeRole, { bg: string; text: string; label: string; border: string }> = {
    Participant: { bg: 'bg-[#075B22]', text: 'text-white', label: 'PARTICIPANT', border: 'border-[#075B22]' },
    Intervenant: { bg: 'bg-[#FF5A00]', text: 'text-white', label: 'INTERVENANT', border: 'border-[#FF5A00]' },
    Organisateur: { bg: 'bg-[#0A2912]', text: 'text-[#FFD700]', label: 'ORGANISATEUR', border: 'border-[#FFD700]' },
    VIP: { bg: 'bg-amber-600', text: 'text-white', label: 'INVITÉ VIP', border: 'border-amber-600' },
    Presse: { bg: 'bg-teal-700', text: 'text-white', label: 'PRESSE & MÉDIAS', border: 'border-teal-700' },
    Staff: { bg: 'bg-emerald-800', text: 'text-white', label: 'ÉQUIPE STAFF', border: 'border-emerald-800' },
  };

  const currentRole = roleColors[registration.role] || roleColors.Participant;

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!badgeRef.current) return;
    setIsExporting(true);
    try {
      // 1080 x 1620 ratio
      const dataUrl = await toPng(badgeRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `Badge-JNUM-2026-${registration.id}.png`;
      link.href = dataUrl;
      link.click();
      if (onDownloaded) onDownloaded();
    } catch (err) {
      console.error('Failed to export PNG badge', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download PDF (A6 format)
  const handleDownloadPdf = async () => {
    if (!badgeRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(badgeRef.current, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      // A6 standard dimensions in mm: 105 x 148 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6',
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 105, 148);
      pdf.save(`Badge-JNUM-2026-${registration.id}.pdf`);
      if (onDownloaded) onDownloaded();
    } catch (err) {
      console.error('Failed to export PDF badge', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : EVENT_CONFIG.social.domain;
    navigator.clipboard.writeText(`${origin}/badge/${registration.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Visual Badge Card (1080x1620 ratio ~ 1 : 1.5) */}
      <div
        ref={badgeRef}
        id={`badge-${registration.id}`}
        className="w-full relative bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200/80 text-neutral-900 select-none"
        style={{ aspectRatio: '1 / 1.5' }}
      >
        {/* Top Header: logo.png en haut sur fond blanc agrandi d'environ 25% (h-20 soit 80px au lieu de 64px) */}
        <div className="bg-white pt-5 pb-2.5 px-6 text-center flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="JNUM – Journée Numérique Musulmane"
            className="h-20 w-auto object-contain"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-neutral-600 mt-1">
            By Sous-Comité 3 de Cocody
          </span>
        </div>

        {/* Bandeau vert : texte centré horizontalement dans toute la largeur, sans aucun logo */}
        <div className="bg-[#075B22] text-white py-2.5 px-4 flex items-center justify-center min-h-[38px]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-100 text-center whitespace-nowrap">
            <span>{EVENT_CONFIG.edition}</span>
            <span>•</span>
            <span>{EVENT_CONFIG.dateDisplay}</span>
          </div>
        </div>

        {/* Role Pill Banner */}
        <div className="w-full flex justify-center -mt-3 relative z-20">
          <div
            className={`px-5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-md ${currentRole.bg} ${currentRole.text} border-2 border-white`}
          >
            {currentRole.label}
          </div>
        </div>

        {/* Participant Identity Section */}
        <div className="px-6 pt-4 pb-2 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display tracking-tight leading-tight line-clamp-2">
            {registration.firstName} {registration.lastName}
          </h2>
          <p className="text-sm font-semibold text-[#075B22] mt-0.5">
            {registration.organization || registration.category}
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-neutral-500 font-medium">
            <span>{registration.jobTitle || registration.category}</span>
            <span>•</span>
            <span>{registration.city}, {registration.country}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center px-6 py-2">
          <div className="p-3 bg-white border-2 border-neutral-200 rounded-xl shadow-inner relative group">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR Code ${registration.id}`}
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-neutral-100 animate-pulse text-xs text-neutral-400">
                Génération QR...
              </div>
            )}
            {/* Corner Decorative Tech Notches */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#075B22]" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#FF5A00]" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#075B22]" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FF5A00]" />
          </div>

          {/* Participant ID */}
          <div className="mt-2 text-center">
            <span className="font-mono text-sm sm:text-base font-black tracking-wider text-neutral-800 bg-neutral-100 px-3 py-0.5 rounded border border-neutral-300">
              {registration.id}
            </span>
            <p className="text-[11px] text-neutral-500 font-medium mt-1">
              Présentez ce QR à l'entrée de la salle
            </p>
            <p className="text-xs sm:text-[13px] font-semibold text-[#075B22] mt-4 mb-1 max-w-[88%] mx-auto leading-snug text-center tracking-tight">
              Sous-Comité 3 de Cocody, Détermination et Efficacité.
            </p>
          </div>
        </div>

        {/* Bottom Location & Signature Orange Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-neutral-50 border-t border-neutral-200 px-4 py-2.5 text-center">
          <p className="text-[11px] font-semibold text-neutral-700 truncate">
            📍 {EVENT_CONFIG.venue.name}
          </p>
          {/* Bottom Orange Trim */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#FF5A00]" />
        </div>
      </div>

      {/* Action Buttons (PNG, PDF, Share, Print) */}
      {showActions && (
        <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#075B22] hover:bg-[#064e1d] text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
            title="Télécharger l'image PNG haute résolution (1080x1620)"
          >
            <Download className="w-4 h-4" />
            <span>Badge PNG</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
            title="Télécharger le badge en format PDF prêt à imprimer"
          >
            <FileText className="w-4 h-4" />
            <span>Format PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Imprimer directement le badge"
          >
            <Printer className="w-4 h-4 text-neutral-600" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Copier le lien public du badge"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-neutral-600" />
                <span>Partager</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
