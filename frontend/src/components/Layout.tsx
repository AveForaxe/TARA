import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ─── Top Navbar (Desktop Only) ────────────────────────── */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Kegiatan', path: '/kegiatan' },
    { name: 'Pasar TARA', path: '/pasar' },
    { name: 'Dasbor', path: '/dasbor' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <span className="material-icons-round">hub</span>
          </div>
          <span className="logo-text">TARA</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" id="navLinks">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

/* ─── Bottom Navigation Bar (Mobile Only) ──────────────── */
const BottomNav: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Beranda',  path: '/',         icon: 'home' },
    { name: 'Kegiatan', path: '/kegiatan', icon: 'event' },
    { name: 'Lapor',    path: '/lapor',    icon: 'campaign', accent: true },
    { name: 'Dasbor',  path: '/dasbor',   icon: 'person' },
  ];

  return (
    <nav className="bottom-nav" id="bottomNav" aria-label="Navigasi Utama">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''} ${tab.accent ? 'accent' : ''}`}
            aria-label={tab.name}
          >
            {tab.accent ? (
              <div className="bottom-nav-fab">
                <span className="material-icons-round">{tab.icon}</span>
              </div>
            ) : (
              <>
                <span className="material-icons-round bottom-nav-icon">{tab.icon}</span>
                <span className="bottom-nav-label">{tab.name}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

/* ─── Footer (Hidden on Mobile via CSS) ─────────────────── */
const Footer: React.FC = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              <div className="logo-icon">
                <span className="material-icons-round">hub</span>
              </div>
              <span className="logo-text">TARA</span>
            </Link>
            <p className="footer-desc">Platform digital terintegrasi untuk Karang Taruna. Digitalisasi semangat komunitas untuk masa depan yang lebih baik.</p>
          </div>
          <div className="footer-links-group">
            <h4>Navigasi</h4>
            <Link to="/">Beranda</Link>
            <Link to="/kegiatan">Kegiatan</Link>
            <Link to="/pasar">Pasar TARA</Link>
            <Link to="/dasbor">Dasbor</Link>
          </div>
          <div className="footer-links-group">
            <h4>Informasi</h4>
            <a href="#">Tentang Kami</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Ketentuan Layanan</a>
            <a href="#">Pedoman Komunitas</a>
          </div>
          <div className="footer-links-group">
            <h4>Kontak</h4>
            <a href="#">Hubungi Kami</a>
            <a href="#">Bantuan</a>
            <a href="#">FAQ</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 TARA Karang Taruna. Masa Depan Komunitas.</p>
        </div>
      </div>
    </footer>
  );
};

/* ─── Layout Wrapper ────────────────────────────────────── */
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
};
