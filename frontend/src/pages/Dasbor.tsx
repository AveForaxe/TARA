import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { useCounter } from '../hooks/useCounter';
import { QRScannerModal } from '../components/QRScannerModal';
import { apiFetch } from '../utils/api';

interface Stats {
  totalWarga: number;
  totalLaporan: number;
  eventMendatang: number;
}

const StatCard = ({ icon, target, label, color }: { icon: string; target: number; label: string; color: string }) => {
  const { count, elementRef } = useCounter(target);
  return (
    <div className="dasbor-stat-card">
      <span className="material-icons-round dasbor-stat-icon" style={{ color }}>{icon}</span>
      <div className="dasbor-stat-num" ref={elementRef}>{count.toLocaleString('id-ID')}</div>
      <div className="dasbor-stat-label">{label}</div>
    </div>
  );
};

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

export const Dasbor: React.FC = () => {
  const [isLocked, setIsLocked]       = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser]               = useState<any>(null);
  const [stats, setStats]             = useState<Stats>({ totalWarga: 0, totalLaporan: 0, eventMendatang: 0 });

  useEffect(() => {
    const token = localStorage.getItem('tara_token');
    const saved = localStorage.getItem('tara_user');
    if (token && saved) { setIsLocked(false); setUser(JSON.parse(saved)); }
    apiFetch('/api/stats').then(r => r.json()).then(d => {
      setStats({ totalWarga: d.totalWarga, totalLaporan: d.totalLaporan, eventMendatang: d.eventMendatang });
    }).catch(() => {});
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLocked(false);
    setShowScanner(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('tara_token');
    localStorage.removeItem('tara_user');
    localStorage.removeItem('tara_device_id');
    setIsLocked(true);
    setUser(null);
  };

  const ROLE_COLOR: Record<string, string> = {
    DEVELOPER:     '#a78bfa',
    ADMINISTRATOR: '#60a5fa',
    KEUANGAN:      '#34d399',
    'KARANG TARUNA': '#f472b6',
    'KETUA RT':    '#fb923c',
    WARGA:         '#94a3b8',
  };
  const roleColor = user ? (ROLE_COLOR[user.role] || '#94a3b8') : '#94a3b8';

  return (
    <>
      <div className="page-enter" style={{ position: 'relative', minHeight: '100vh' }}>

        {/* ── Page header ── */}
        <section className="page-header" style={{
          filter: isLocked ? 'blur(10px)' : 'none',
          transition: 'filter 0.7s ease',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}>
          <div className="container">
            <Reveal>
              <div className="dasbor-header-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="section-badge">CITIZEN DASHBOARD</span>
                  <h1 style={{ marginBottom: '8px' }}>
                    Selamat Datang,{' '}
                    <span className="text-gradient">{user ? user.nama.split(' ')[0] : 'Warga'}</span>.
                  </h1>
                  <p style={{ maxWidth: '560px', margin: 0, color: 'var(--on-surface-variant)' }}>
                    Pantau kontribusi Anda, laporkan masalah lingkungan, dan tetap terhubung dengan kegiatan Karang Taruna.
                  </p>
                </div>

                {!isLocked && user && (
                  <div className="dasbor-user-chip">
                    <div className="dasbor-avatar" style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}44` }}>
                      <span style={{ color: roleColor, fontWeight: 800, fontSize: '0.9rem' }}>
                        {getInitials(user.nama)}
                      </span>
                    </div>
                    <div className="dasbor-user-info">
                      <span className="dasbor-user-name">{user.nama}</span>
                      <span className="dasbor-user-meta" style={{ color: roleColor }}>
                        {user.role} · {user.blok}
                      </span>
                    </div>
                    <button onClick={handleLogout} className="dasbor-logout-btn" title="Keluar">
                      <span className="material-icons-round">logout</span>
                    </button>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Main content ── */}
        <section className="section" style={{
          paddingTop: '32px',
          filter: isLocked ? 'blur(12px)' : 'none',
          transition: 'filter 0.7s ease',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}>
          <div className="container">

            {/* Stats grid */}
            <Reveal>
              <div className="dasbor-stats-grid">
                <StatCard icon="groups"     target={stats.totalWarga}     label="WARGA TERDAFTAR" color="#f472b6" />
                <StatCard icon="event"      target={stats.eventMendatang} label="KEGIATAN AKTIF"  color="#60a5fa" />
                <StatCard icon="flag"       target={stats.totalLaporan}   label="LAPORAN MASUK"   color="#34d399" />
                <StatCard icon="storefront" target={35}                   label="UMKM MITRA"       color="#fb923c" />
              </div>
            </Reveal>

            {/* Two-column layout */}
            <div className="dasbor-two-col">

              {/* Left column */}
              <div className="dasbor-left-col">

                {/* My reports */}
                <Reveal className="glass-card dasbor-card">
                  <div className="dasbor-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons-round" style={{ color: 'var(--cyber-pink)' }}>campaign</span>
                      <h3 className="dasbor-card-title">Laporan Saya</h3>
                    </div>
                    <Link to="/lapor" className="btn btn-primary btn-sm">
                      <span className="material-icons-round">add</span> Buat Laporan
                    </Link>
                  </div>

                  {/* Empty state if no real data yet */}
                  <div className="dasbor-empty-state">
                    <span className="material-icons-round dasbor-empty-icon">inbox</span>
                    <p>Belum ada laporan yang dibuat.</p>
                    <Link to="/lapor" style={{ color: 'var(--cyber-pink)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                      Buat laporan pertama →
                    </Link>
                  </div>
                </Reveal>

                {/* Quick actions */}
                <Reveal className="glass-card dasbor-card">
                  <div className="dasbor-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons-round" style={{ color: '#60a5fa' }}>apps</span>
                      <h3 className="dasbor-card-title">Layanan Warga</h3>
                    </div>
                  </div>
                  <div className="dasbor-quick-grid">
                    {[
                      { icon: 'campaign',   label: 'Buat Laporan', to: '/lapor',   color: 'var(--cyber-pink)' },
                      { icon: 'event',      label: 'Kegiatan',     to: '/kegiatan', color: '#60a5fa' },
                      { icon: 'storefront', label: 'Pasar TARA',   to: '/pasar',   color: '#fb923c' },
                      { icon: 'home',       label: 'Beranda',      to: '/',        color: '#34d399' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} className="dasbor-quick-item">
                        <div className="dasbor-quick-icon" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                          <span className="material-icons-round" style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <span className="dasbor-quick-label">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* Right column */}
              <div className="dasbor-right-col">

                {/* User identity card */}
                <Reveal className="glass-card dasbor-card dasbor-identity-card">
                  <div style={{ textAlign: 'center' }}>
                    <div className="dasbor-identity-avatar" style={{
                      background: isLocked ? 'rgba(255,255,255,0.04)' : `${roleColor}18`,
                      border: `2px solid ${isLocked ? 'rgba(255,255,255,0.08)' : `${roleColor}40`}`,
                      boxShadow: isLocked ? 'none' : `0 0 30px ${roleColor}25`,
                    }}>
                      {user
                        ? <span style={{ fontSize: '2rem', fontWeight: 800, color: roleColor }}>{getInitials(user.nama)}</span>
                        : <span className="material-icons-round" style={{ fontSize: '2.2rem', color: '#374151' }}>person</span>
                      }
                    </div>
                    <div className="dasbor-identity-name">{user ? user.nama : '—'}</div>
                    <div className="dasbor-identity-ucid">{user ? user.ucid : 'Belum masuk'}</div>
                    {user && (
                      <span className="dasbor-role-badge" style={{ background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}30` }}>
                        {user.role}
                      </span>
                    )}
                  </div>

                  {user && (
                    <div className="dasbor-identity-meta">
                      <div className="dasbor-meta-row">
                        <span className="material-icons-round">holiday_village</span>
                        <span>Blok {user.blok}</span>
                      </div>
                      <div className="dasbor-meta-row">
                        <span className="material-icons-round">verified_user</span>
                        <span>Terverifikasi</span>
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={() => setShowScanner(true)}>
                      <span className="material-icons-round">qr_code_scanner</span>
                      Scan QR untuk Masuk
                    </button>
                  )}
                </Reveal>

                {/* Info card */}
                <Reveal className="glass-card dasbor-card">
                  <div className="dasbor-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons-round" style={{ color: '#34d399' }}>info</span>
                      <h3 className="dasbor-card-title">Info Komunitas</h3>
                    </div>
                  </div>
                  <div className="dasbor-info-list">
                    <div className="dasbor-info-item">
                      <span className="material-icons-round" style={{ color: '#60a5fa', fontSize: '18px' }}>notifications_active</span>
                      <div>
                        <div style={{ color: '#e5e7eb', fontSize: '0.85rem', fontWeight: 600 }}>Karang Taruna TARA</div>
                        <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>Platform digital komunitas warga</div>
                      </div>
                    </div>
                    <div className="dasbor-info-item">
                      <span className="material-icons-round" style={{ color: '#34d399', fontSize: '18px' }}>security</span>
                      <div>
                        <div style={{ color: '#e5e7eb', fontSize: '0.85rem', fontWeight: 600 }}>Data Aman & Terenkripsi</div>
                        <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>Identitas dijaga dengan JWT 30 hari</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Lock overlay ── */}
      {isLocked && (
        <div className="dasbor-lock-overlay">
          <Reveal className="dasbor-lock-card">
            {/* Animated lock icon */}
            <div className="dasbor-lock-icon-wrap">
              <span className="material-icons-round dasbor-lock-icon">lock</span>
            </div>

            <h2 className="dasbor-lock-title">Dasbor Terkunci</h2>
            <p className="dasbor-lock-desc">
              Scan <strong style={{ color: '#fff' }}>QR Identity</strong> Anda untuk membuka akses penuh ke layanan warga TARA.
            </p>

            <button className="btn btn-primary btn-premium dasbor-lock-btn" onClick={() => setShowScanner(true)}>
              <span className="material-icons-round">qr_code_scanner</span>
              Mulai Scan QR
            </button>

            <Link to="/" className="dasbor-lock-back">
              <span className="material-icons-round">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </Reveal>
        </div>
      )}

      {/* ── QR Scanner Modal ── */}
      {showScanner && (
        <QRScannerModal onSuccess={handleAuthSuccess} onClose={() => setShowScanner(false)} />
      )}

      <style>{`
        /* Header row */
        .dasbor-header-row {
          display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap;
          justify-content: space-between;
        }

        /* User chip */
        .dasbor-user-chip {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 50px; padding: 6px 8px 6px 6px;
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
        .dasbor-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: grid; place-items: center; flex-shrink: 0;
        }
        .dasbor-user-info {
          display: flex; flex-direction: column; min-width: 0;
        }
        .dasbor-user-name {
          color: #f3f4f6; font-size: 0.82rem; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;
        }
        .dasbor-user-meta {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .dasbor-logout-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.18);
          color: #f87171; cursor: pointer;
          display: grid; place-items: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .dasbor-logout-btn:hover { background: #f87171; color: #fff; transform: rotate(-8deg) scale(1.05); }
        .dasbor-logout-btn .material-icons-round { font-size: 16px; }

        /* Stats */
        .dasbor-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }
        .dasbor-stat-card {
          background: rgba(22,23,25,0.8); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 24px 16px; text-align: center;
        }
        .dasbor-stat-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .dasbor-stat-num  { font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 6px; }
        .dasbor-stat-label { font-size: 0.65rem; color: var(--on-surface-variant); font-weight: 700; letter-spacing: 0.12em; }

        /* Two-col layout */
        .dasbor-two-col {
          display: flex; flex-direction: column; gap: 20px;
        }
        .dasbor-left-col  { display: flex; flex-direction: column; gap: 20px; }
        .dasbor-right-col { display: flex; flex-direction: column; gap: 20px; }

        /* Card base */
        .dasbor-card {
          background: rgba(22,23,25,0.7) !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          padding: 22px !important;
        }
        .dasbor-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px; gap: 8px;
        }
        .dasbor-card-title { color: #f3f4f6; font-size: 1rem; font-weight: 700; margin: 0; }

        /* Empty state */
        .dasbor-empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 28px 16px; text-align: center; color: #4b5563; font-size: 0.82rem;
        }
        .dasbor-empty-icon { font-size: 40px; color: #1f2937; margin-bottom: 4px; }

        /* Quick actions grid */
        .dasbor-quick-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
        }
        .dasbor-quick-item {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 16px 8px; border-radius: 12px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
          text-decoration: none; transition: all 0.2s;
        }
        .dasbor-quick-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }
        .dasbor-quick-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: grid; place-items: center;
        }
        .dasbor-quick-icon .material-icons-round { font-size: 22px; }
        .dasbor-quick-label { font-size: 0.72rem; color: #6b7280; font-weight: 600; text-align: center; }

        /* Identity card */
        .dasbor-identity-card { text-align: center; }
        .dasbor-identity-avatar {
          width: 80px; height: 80px; border-radius: 50%;
          display: grid; place-items: center;
          margin: 0 auto 16px;
          transition: all 0.5s ease;
        }
        .dasbor-identity-name {
          color: #f3f4f6; font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;
        }
        .dasbor-identity-ucid { color: #4b5563; font-size: 0.72rem; font-family: monospace; margin-bottom: 10px; }
        .dasbor-role-badge {
          display: inline-block; font-size: 0.62rem; font-weight: 800;
          letter-spacing: 0.08em; padding: 3px 10px; border-radius: 100px;
        }
        .dasbor-identity-meta {
          margin-top: 16px; padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; gap: 8px;
        }
        .dasbor-meta-row {
          display: flex; align-items: center; gap: 8px;
          color: #6b7280; font-size: 0.78rem;
        }
        .dasbor-meta-row .material-icons-round { font-size: 16px; }

        /* Info list */
        .dasbor-info-list { display: flex; flex-direction: column; gap: 12px; }
        .dasbor-info-item { display: flex; align-items: flex-start; gap: 12px; }

        /* Lock overlay */
        .dasbor-lock-overlay {
          position: fixed; inset: 0; z-index: 150;
          display: grid; place-items: center;
          background: rgba(4, 6, 15, 0.55);
          backdrop-filter: blur(28px);
          padding: 24px;
          animation: dasborFadeIn 0.5s ease;
        }
        @keyframes dasborFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .dasbor-lock-card {
          background: rgba(17,18,20,0.92) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 28px !important;
          padding: 44px 32px !important;
          text-align: center;
          max-width: 380px; width: 100%;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
        }

        .dasbor-lock-icon-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,77,141,0.08);
          border: 1px solid rgba(255,77,141,0.25);
          box-shadow: 0 0 40px rgba(255,77,141,0.12);
          display: grid; place-items: center;
          margin: 0 auto 24px;
        }
        .dasbor-lock-icon {
          font-size: 38px; color: var(--cyber-pink);
          animation: dasborLockPulse 2.5s ease-in-out infinite;
        }
        @keyframes dasborLockPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.08); opacity: 0.8; }
        }

        .dasbor-lock-title {
          color: #fff; font-size: 1.6rem; font-weight: 800;
          margin-bottom: 12px; letter-spacing: -0.02em;
        }
        .dasbor-lock-desc {
          color: #4b5563; font-size: 0.88rem; line-height: 1.7;
          margin-bottom: 28px; max-width: 280px; margin-left: auto; margin-right: auto;
        }
        .dasbor-lock-btn {
          width: 100%; height: 52px; border-radius: 16px; font-size: 0.95rem;
          margin-bottom: 18px;
        }
        .dasbor-lock-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #374151; font-size: 0.82rem; font-weight: 600;
          text-decoration: none; transition: color 0.2s;
        }
        .dasbor-lock-back:hover { color: #6b7280; }
        .dasbor-lock-back .material-icons-round { font-size: 16px; }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .dasbor-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .dasbor-two-col {
            flex-direction: row; align-items: flex-start;
          }
          .dasbor-left-col  { flex: 2; min-width: 0; }
          .dasbor-right-col { flex: 1; min-width: 0; }
          .dasbor-stat-num  { font-size: 2.6rem; }
        }

        /* ── Small mobile ── */
        @media (max-width: 400px) {
          .dasbor-lock-card { padding: 32px 20px !important; }
          .dasbor-lock-title { font-size: 1.35rem; }
          .dasbor-user-name  { max-width: 100px; }
        }
      `}</style>
    </>
  );
};
