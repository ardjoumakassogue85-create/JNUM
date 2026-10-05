import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JnumLogo } from '../../components/common/JnumLogo';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      // Admin account
      const isAdmin = cleanEmail === 'sc3@jnum.org' && cleanPassword === 'Jnum2026';
      // Agent d'accueil account
      const isScanner = cleanEmail === 'scanner@jnum-event.org' && cleanPassword === 'Scan2026';

      if (isAdmin || isScanner) {
        localStorage.setItem(
          'jnum_admin_auth',
          JSON.stringify({
            email: cleanEmail,
            role: isScanner ? 'scanner' : 'admin',
            loggedAt: new Date().toISOString(),
          })
        );
        if (isScanner) {
          navigate('/admin/scan');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-neutral-200/90 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <JnumLogo size="lg" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 mt-1.5">
              By Sous-Comité 3 de Cocody
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#075B22]/10 text-[#075B22] text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>Portail Staff & Organisation</span>
          </div>
          <h1 className="text-2xl font-black font-display text-neutral-900">
            Espace d'Administration
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Gestion des inscriptions, scan QR d'émargement et suivi de l'événement.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Adresse email staff
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.org"
              autoComplete="off"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#075B22] hover:bg-[#064e1d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
