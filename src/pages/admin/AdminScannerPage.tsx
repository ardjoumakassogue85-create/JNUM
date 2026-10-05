import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import jsQR from 'jsqr';
import {
  getAllRegistrations,
  checkInParticipant,
  verifyQrSignature,
} from '../../services/registrationService';
import { Registration } from '../../types';
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Volume2,
  VolumeX,
  ArrowLeft,
  UserCheck,
  RefreshCw,
  QrCode,
  Zap,
} from 'lucide-react';

export const AdminScannerPage: React.FC = () => {
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    participant?: Registration;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [manualQuery, setManualQuery] = useState<string>('');
  const [scannedCount, setScannedCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Web Audio Synth Beeper for tactile auditory feedback
  const playSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        // High upbeat chime (880Hz -> 1320Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'warning') {
        // Double warning blip (440Hz)
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Low error buzz (180Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  // Start Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('Camera access error or desktop environment:', err);
        setCameraActive(false);
      }
    }

    if (cameraActive) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive]);

  // Frame processing loop for QR scanner
  useEffect(() => {
    const processFrame = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current &&
        !isProcessing
      ) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedQr(code.data);
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(processFrame);
    };

    animationFrameId.current = requestAnimationFrame(processFrame);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isProcessing]);

  // Handle scanned raw string (e.g., https://[domain]/verify/JNUM-2026-AB12CD?t=...)
  const handleDecodedQr = async (data: string) => {
    setIsProcessing(true);

    try {
      let participantId = '';
      let token = '';

      if (data.includes('/verify/')) {
        const url = new URL(data);
        const parts = url.pathname.split('/');
        participantId = parts[parts.length - 1];
        token = url.searchParams.get('t') || '';
      } else if (data.startsWith('JNUM-2026-')) {
        participantId = data.trim();
      }

      if (!participantId) {
        playSound('error');
        setScanResult({
          status: 'error',
          title: 'QR Code Non Reconnu',
          message: 'Le code scanné n\'est pas un badge JNUM officiel.',
        });
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }

      // Check signature if present
      if (token && !verifyQrSignature(participantId, token)) {
        playSound('error');
        setScanResult({
          status: 'error',
          title: 'Signature Altérée',
          message: 'Ce badge est falsifié ou a été modifié illégalement.',
        });
        setTimeout(() => setIsProcessing(false), 2500);
        return;
      }

      // Execute check-in
      const res = await checkInParticipant(participantId, 'Scanner Entrée Porte 1');

      if (res.success && res.registration) {
        playSound('success');
        setScannedCount((c) => c + 1);
        setScanResult({
          status: 'success',
          title: 'ACCÈS VALIDÉ',
          message: 'Bienvenue à la JNUM !',
          participant: res.registration,
        });
      } else if (res.registration && res.registration.checkedIn) {
        playSound('warning');
        setScanResult({
          status: 'warning',
          title: 'DÉJÀ ÉMARGÉ',
          message: res.message,
          participant: res.registration,
        });
      } else {
        playSound('error');
        setScanResult({
          status: 'error',
          title: 'Participant Introuvable',
          message: res.message,
        });
      }
    } catch (e: any) {
      playSound('error');
      setScanResult({
        status: 'error',
        title: 'Erreur d\'analyse',
        message: e.message || 'Impossible de lire le QR code.',
      });
    } finally {
      setTimeout(() => setIsProcessing(false), 2500);
    }
  };

  // Manual participant lookup (for phone battery dead or forgot ticket)
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    const list = getAllRegistrations();
    const q = manualQuery.toLowerCase().trim();

    const found = list.find(
      (r) =>
        r.id.toLowerCase() === q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        (r.phoneNumber || r.whatsappPhone || '').replace(/[^0-9]/g, '').includes(q)
    );

    if (found) {
      const res = await checkInParticipant(found.id, 'Scanner Manuel');
      if (res.success && res.registration) {
        playSound('success');
        setScannedCount((c) => c + 1);
        setScanResult({
          status: 'success',
          title: 'ACCÈS VALIDÉ (Recherche)',
          message: 'Émargement manuel enregistré.',
          participant: res.registration,
        });
      } else if (found.checkedIn) {
        playSound('warning');
        setScanResult({
          status: 'warning',
          title: 'DÉJÀ ÉMARGÉ',
          message: `Émargé le ${new Date(found.checkedInAt || '').toLocaleTimeString('fr-FR')}`,
          participant: found,
        });
      }
    } else {
      playSound('error');
      setScanResult({
        status: 'error',
        title: 'Introuvable',
        message: 'Aucun participant ne correspond à cette recherche.',
      });
    }
    setManualQuery('');
  };

  // Test scan simulation button
  const handleSimulateScan = () => {
    const list = getAllRegistrations();
    if (list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      const target = list[randomIndex];
      handleDecodedQr(target.qrVerificationUrl);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Scanner Header */}
      <header className="px-4 py-3 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between z-20">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
            Entrées : {scannedCount}
          </span>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-700/50"
            title="Activer/Désactiver le bip sonore"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Camera Video Surface */}
        <div className="w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden relative shadow-2xl border-2 border-neutral-700 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay Aim Viewfinder Frame */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
            <div className="w-60 h-60 border-2 border-dashed border-white/60 rounded-3xl relative flex items-center justify-center">
              {/* Corner Notches */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FF5A00] rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#075B22] rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#075B22] rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FF5A00] rounded-br-xl" />

              {/* Scanning red line animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF5A00] to-transparent animate-pulse" />
            </div>
            <p className="text-[11px] text-white/70 font-semibold mt-4 text-center">
              Placez le QR code du participant au centre
            </p>
          </div>

          {/* Real-time Result Overlay */}
          {scanResult && (
            <div
              className={`absolute inset-0 p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-150 z-30 ${
                scanResult.status === 'success'
                  ? 'bg-emerald-950/95 text-white'
                  : scanResult.status === 'warning'
                  ? 'bg-amber-950/95 text-white'
                  : 'bg-red-950/95 text-white'
              }`}
            >
              {scanResult.status === 'success' && (
                <CheckCircle className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
              )}
              {scanResult.status === 'warning' && (
                <AlertTriangle className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
              )}
              {scanResult.status === 'error' && (
                <XCircle className="w-16 h-16 text-red-400 mb-3" />
              )}

              <h2 className="text-2xl font-black font-display tracking-tight">
                {scanResult.title}
              </h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-xs">
                {scanResult.message}
              </p>

              {scanResult.participant && (
                <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-xs border border-white/20">
                  <p className="text-lg font-black text-white">
                    {scanResult.participant.firstName} {scanResult.participant.lastName}
                  </p>
                  <p className="text-xs font-semibold text-[#FF5A00] mt-0.5">
                    {scanResult.participant.role} • {scanResult.participant.category}
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {scanResult.participant.organization}
                  </p>
                  <div className="mt-2 font-mono text-xs text-neutral-400">
                    ID : {scanResult.participant.id}
                  </div>
                </div>
              )}

              <button
                onClick={() => setScanResult(null)}
                className="mt-6 px-6 py-2 bg-white text-neutral-900 rounded-xl text-xs font-bold"
              >
                Suivant (Scan)
              </button>
            </div>
          )}
        </div>

        {/* Quick Simulation Button for Testing */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleSimulateScan}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5"
            title="Tester avec un badge aléatoire"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>Tester Scan Démo</span>
          </button>
        </div>

        {/* Emergency Manual Search Bar */}
        <div className="w-full max-w-sm mt-4">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Saisie secours : Nom ou ID..."
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#075B22]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#075B22] hover:bg-[#064e1d] text-white text-xs font-bold rounded-xl active:scale-95"
            >
              Valider
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
