import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllRegistrations,
  getRegistrationStats,
  exportRegistrationsCsv,
  updateRegistrationStatus,
  checkInParticipant,
} from '../../services/registrationService';
import { Registration, RegistrationStats } from '../../types';
import { EVENT_CONFIG } from '../../config/event';
import {
  Users,
  CheckCircle,
  Clock,
  Download,
  Search,
  Filter,
  MessageCircle,
  QrCode,
  Calendar,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCheckIn, setFilterCheckIn] = useState('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const navigate = useNavigate();

  const loadData = () => {
    const list = getAllRegistrations();
    setRegistrations(list);
    setStats(getRegistrationStats());
  };

  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem('jnum_admin_auth');
    if (!auth) {
      navigate('/admin/login');
      return;
    }
    loadData();

    window.addEventListener('jnum_registrations_updated', loadData);
    return () => {
      window.removeEventListener('jnum_registrations_updated', loadData);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jnum_admin_auth');
    navigate('/admin/login');
  };

  const handleToggleCheckIn = async (reg: Registration) => {
    if (!reg.checkedIn) {
      await checkInParticipant(reg.id, 'Admin Dashboard');
    } else {
      updateRegistrationStatus(reg.id, {
        checkedIn: false,
        checkedInAt: undefined,
        checkedInBy: undefined,
      });
    }
    loadData();
  };

  // Filter registrations
  const filtered = registrations.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterCheckIn === 'checked' && !r.checkedIn) return false;
    if (filterCheckIn === 'unchecked' && r.checkedIn) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${r.firstName} ${r.lastName}`.toLowerCase().includes(q);
      const matchEmail = (r.email || '').toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      const matchOrg = r.organization.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchOrg) return false;
    }
    return true;
  });

  const dominantCategory = (() => {
    if (!stats || stats.totalRegistered === 0) return 'Aucun';
    const entries = Object.entries(stats.byCategory);
    if (entries.length === 0) return 'Aucun';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  })();

  return (
    <div className="min-h-screen bg-[#F7FAF7] pb-16">
      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-xl text-[#075B22]">
              J<span className="text-[#FF5A00]">N</span>UM
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#075B22] text-[10px] font-extrabold uppercase tracking-wider">
              Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/scan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5A00] hover:bg-[#E04E00] text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Ouvrir le Scanner QR</span>
            </Link>

            <Link
              to="/admin/sessions"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#075B22]" />
              <span>Gestion Sessions</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Real-time Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Metric 1: Inscrits Totaux */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Inscriptions Totales
                </span>
                <p className="text-3xl font-black font-display text-neutral-900 mt-1">
                  {stats.totalRegistered}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#075B22] h-full"
                      style={{
                        width: `${Math.min(100, (stats.totalRegistered / EVENT_CONFIG.capacity.maxParticipants) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 font-semibold">
                    {Math.round((stats.totalRegistered / EVENT_CONFIG.capacity.maxParticipants) * 100)}% de jauge ({EVENT_CONFIG.capacity.maxParticipants} places)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-[#075B22] rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 2: Taux d'émargement Jour J */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Émargements Jour J
                </span>
                <p className="text-3xl font-black font-display text-[#075B22] mt-1">
                  {stats.totalCheckedIn}
                </p>
                <p className="text-xs text-neutral-500 font-semibold mt-2">
                  Taux de présence : <strong>{stats.checkInRate}%</strong>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-[#075B22] rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 3: Statut WhatsApp */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Badges Envoyés WhatsApp
                </span>
                <p className="text-3xl font-black font-display text-emerald-600 mt-1">
                  {stats.whatsappSent}
                </p>
                <p className="text-xs text-neutral-500 font-semibold mt-2">
                  Délivrance : <strong>{Math.round((stats.whatsappSent / Math.max(1, stats.totalRegistered)) * 100)}%</strong>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-[#25D366] rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 4: Catégorie N°1 */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Profil Dominant
                </span>
                <p className="text-xl font-black font-display text-[#FF5A00] mt-1 truncate max-w-[170px]">
                  {dominantCategory}
                </p>
                <p className="text-xs text-neutral-500 font-semibold mt-2">
                  Étudiants : {stats.byCategory['Étudiant'] || 0} • Pros : {stats.byCategory['Professionnel'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 text-[#FF5A00] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Action Bar & Filters */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, ID ou organisation..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
              />
            </div>

            {/* Filters & Export CSV */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B22]"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Étudiant">Étudiants</option>
                <option value="Professionnel">Professionnels</option>
                <option value="Entrepreneur">Entrepreneurs</option>
                <option value="Enseignant">Enseignants</option>
                <option value="Association">Associations</option>
              </select>

              <select
                value={filterCheckIn}
                onChange={(e) => setFilterCheckIn(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B22]"
              >
                <option value="all">Tous statuts</option>
                <option value="checked">Émargés uniquement</option>
                <option value="unchecked">Non émargés</option>
              </select>

              <button
                onClick={exportRegistrationsCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#075B22] hover:bg-[#064e1d] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                title="Télécharger la liste complète au format CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Registrations Data Table */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Participant / ID</th>
                  <th className="py-3 px-4">Organisation & Poste</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Contact (WhatsApp)</th>
                  <th className="py-3 px-4">Statut Jour J</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Participant / ID */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 text-sm">
                        {reg.firstName} {reg.lastName}
                      </div>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {reg.id}
                      </span>
                    </td>

                    {/* Org */}
                    <td className="py-3 px-4 text-neutral-700">
                      <div className="truncate max-w-[180px] font-semibold">{reg.organization}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">{reg.jobTitle}</div>
                    </td>

                    {/* Catégorie */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-bold text-[10px]">
                        {reg.category}
                      </span>
                    </td>

                    {/* WhatsApp Phone */}
                    <td className="py-3 px-4">
                      <div className="text-neutral-800">{reg.phoneNumber}</div>
                      <span className="text-[10px] text-neutral-400">{reg.email}</span>
                    </td>

                    {/* Check-in Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleCheckIn(reg)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          reg.checkedIn
                            ? 'bg-emerald-100 text-[#075B22] hover:bg-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                        title="Cliquer pour basculer le statut d'émargement"
                      >
                        {reg.checkedIn ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Émargé</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Non émargé</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/badge/${reg.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-semibold"
                        title="Voir le badge en ligne"
                      >
                        <span>Badge</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <a
                        href={`https://wa.me/${(reg.phoneNumber || reg.whatsappPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Salam alaykum ${reg.firstName}, voici votre badge pour la JNUM : ${reg.qrVerificationUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#25D366] rounded-lg text-[11px] font-semibold"
                        title="Réenvoyer le badge sur WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-neutral-500 text-xs sm:text-sm">
              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-600">
                {registrations.length === 0
                  ? 'Aucun participant inscrit pour le moment.'
                  : 'Aucun inscrit trouvé pour ces critères de recherche.'}
              </p>
              {registrations.length === 0 && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  Les nouvelles inscriptions via le formulaire apparaîtront ici en temps réel.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
