import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { JnumLogo } from './JnumLogo';
import { EVENT_CONFIG } from '../../config/event';
import { Calendar, Users, MapPin, Info, Menu, X, Shield, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/', icon: null },
    { name: 'Programme', path: '/programme', icon: Calendar },
    { name: 'Intervenants', path: '/intervenants', icon: Users },
    { name: 'Infos Pratiques', path: '/#infos', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#075B22] text-white border-b border-[#054519] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand: Header vert => logo-light.png */}
          <Link to="/" className="flex items-center gap-2 py-2" onClick={() => setMobileMenuOpen(false)}>
            <JnumLogo size="md" light={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'text-white bg-white/15 font-bold'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Espace Organisateur & Scan Check-in"
            >
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="hidden lg:inline">Espace Staff</span>
            </Link>

            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5A00] hover:bg-[#E04E00] text-white text-sm font-bold rounded-xl shadow-md shadow-[#FF5A00]/20 hover:shadow-lg hover:shadow-[#FF5A00]/30 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Je m'inscris</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/inscription"
              className="px-3.5 py-2 bg-[#FF5A00] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              S'inscrire
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg focus:outline-none"
              aria-label="Ouvrir le menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#075B22] border-t border-[#054519] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    active
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-300" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-emerald-800 flex flex-col gap-2">
              <Link
                to="/inscription"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#FF5A00] text-white font-bold rounded-xl shadow-md"
              >
                Je m'inscris gratuitement
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-emerald-900/60 text-emerald-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Espace Organisateur & Scan QR</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
