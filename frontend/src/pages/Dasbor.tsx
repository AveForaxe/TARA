import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { useCounter } from '../hooks/useCounter';
import { QRScannerModal } from '../components/QRScannerModal';
import { apiFetch } from '../utils/api';

const CounterCard = ({ icon, target, label, colorClass }: { icon: string, target: number, label: string, colorClass: string }) => {
  const { count, elementRef } = useCounter(target);
  return (
    <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', background: '#161719', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <span className={`material-icons-round ${colorClass}`} style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}>{icon}</span>
      <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1 }} ref={elementRef}>{count.toLocaleString()}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
};

export const Dasbor: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({
    totalWarga: 0,
    totalLaporan: 0,
    eventMendatang: 0
  });
  const [user, setUser] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/stats');
      const data = await res.json();
      setStats({
        totalWarga: data.totalWarga,
        totalLaporan: data.totalLaporan,
        eventMendatang: data.eventMendatang
      });
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('tara_token');
    const savedUser = localStorage.getItem('tara_user');
    if (savedToken && savedUser) {
      setIsLocked(false);
      setUser(JSON.parse(savedUser));
    }
    fetchStats();
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLocked(false);
    setShowScanner(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('tara_token');
    localStorage.removeItem('tara_user');
    setIsLocked(true);
    setUser(null);
  };

  return (
    <div className="page-enter" style={{ 
      position: 'relative', 
      height: isLocked ? '100vh' : 'auto', 
      overflow: isLocked ? 'hidden' : 'visible' 
    }}>
      {/* Pink Glow when unlocked */}
      {!isLocked && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px rgba(216, 150, 167, 0.05)',
          zIndex: 0,
          animation: 'fade-in 1s ease'
        }} />
      )}

      <section className="page-header" style={{ filter: isLocked ? 'blur(8px)' : 'none', transition: 'filter 0.8s ease' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <span className="section-badge">CITIZEN DASHBOARD</span>
                <h1 style={{ marginBottom: '8px' }}>Selamat Datang, <span className="text-gradient">{user ? user.nama : 'Warga'}</span>.</h1>
                <p style={{ maxWidth: '600px', margin: 0 }}>Pantau kontribusi Anda, laporkan masalah lokal, dan tetap terhubung dengan inisiatif Karang Taruna.</p>
              </div>
              
              {!isLocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="glass-card" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '8px 12px 8px 16px',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                      {user?.ucid || 'TARA-USER'}
                    </span>
                    <button 
                      onClick={handleLogout}
                      style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        color: '#f87171',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      className="logout-btn-hover"
                      title="Keluar"
                    >
                      <span className="material-icons-round" style={{ fontSize: '18px' }}>logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        .logout-btn-hover:hover {
          background: #f87171 !important;
          color: #fff !important;
          transform: rotate(-10deg) scale(1.1);
          box-shadow: 0 0 15px rgba(248, 113, 113, 0.4);
        }
      `}</style>

      <section className="section" style={{ paddingTop: '40px', filter: isLocked ? 'blur(12px)' : 'none', transition: 'filter 0.8s ease' }}>
        <div className="container">
          <Reveal>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', marginBottom: '32px' }}>
              <CounterCard icon="groups" target={stats.totalWarga} label="WARGA TERDAFTAR" colorClass="text-pink-500" />
              <CounterCard icon="event" target={stats.eventMendatang} label="KEGIATAN AKTIF" colorClass="text-blue-400" />
              <CounterCard icon="check_circle" target={stats.totalLaporan} label="LAPORAN MASUK" colorClass="text-green-400" />
              <CounterCard icon="storefront" target={35} label="UMKM MITRA" colorClass="text-orange-300" />
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="dasbor-two-col">
            {/* Left Column */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Issue Tracker */}
              <Reveal className="glass-card" style={{ background: '#161719', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                    <span className="material-icons-round text-pink-500">campaign</span> Laporan & Aspirasi Saya
                  </h3>
                  <Link to="/lapor" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>add_circle</span> Buat Laporan
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: '#1e1f23', borderRadius: '12px' }}>
                    <span className="material-icons-round text-pink-500" style={{ fontSize: '20px' }}>warning</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Street Lighting Failure - Sector 4</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>2 jam lalu • Public Works</div>
                    </div>
                    <span className="status-badge status-progress">Proses</span>
                  </div>
                </div>
                <Link to="/lapor" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '24px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyber-pink)' }}>
                  Lihat Semua Laporan <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
              </Reveal>

              {/* Announcements */}
              <Reveal className="glass-card" style={{ background: '#161719', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                  <span className="material-icons-round text-blue-400">campaign</span> Pengumuman
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '20px', background: '#1e1f23', borderRadius: '12px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '1rem' }}>Lokakarya Literasi Digital</h4>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.5 }}>Bergabunglah di Balai Warga untuk pelatihan keamanan digital dan penggunaan alat komunitas.</p>
                  </div>
                </div>
              </Reveal>
            </div>
            
            {/* Right Column */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Reveal className="glass-card" style={{ textAlign: 'center', borderColor: 'rgba(255,77,141,0.15)', background: '#161719', padding: '32px 24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', color: '#ffb3c6', display: 'block', marginBottom: '24px' }}>SKOR DAMPAK ANDA</span>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '6px solid var(--cyber-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(255,77,141,0.3), inset 0 0 20px rgba(255,77,141,0.2)' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 800, color: '#fff' }}>87</span>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>Top 5% of community contributors this month.</p>
              </Reveal>

              {/* Peta Lokal */}
              <Reveal className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                  <span className="material-icons-round text-green-400">map</span> Peta Lokal
                </h3>
                <div style={{ background: '#111216', borderRadius: '12px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
                  <span className="material-icons-round" style={{ fontSize: '48px', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>public</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Peta interaktif komunitas</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Lock Overlay */}
      {isLocked && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(2, 4, 12, 0.4)',
          backdropFilter: 'blur(24px)',
          padding: '24px',
          animation: 'fade-in 0.8s ease'
        }}>
          <Reveal className="glass-card" style={{ 
            padding: '48px 32px', 
            textAlign: 'center', 
            maxWidth: '420px', 
            background: 'rgba(22, 23, 25, 0.7)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ 
              width: '80px', height: '80px', 
              borderRadius: '50%', background: 'rgba(255, 77, 141, 0.1)',
              display: 'grid', placeItems: 'center', margin: '0 auto 24px',
              border: '1px solid rgba(255, 77, 141, 0.3)',
              boxShadow: '0 0 30px rgba(255, 77, 141, 0.2)'
            }}>
              <span className="material-icons-round" style={{ 
                fontSize: '40px', color: 'var(--cyber-pink)',
                animation: 'pulse-slow 2s infinite'
              }}>lock</span>
            </div>
            
            <h2 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.75rem', fontWeight: 800 }}>Dasbor Terkunci</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: 1.6 }}>
              Untuk keamanan data pribadi, silakan scan <strong style={{ color: '#fff' }}>QR Identity</strong> Anda guna membuka akses penuh ke layanan warga.
            </p>
            
            <button 
              className="btn btn-primary btn-premium" 
              style={{ width: '100%', marginBottom: '20px' }}
              onClick={() => setShowScanner(true)}
            >
              <span className="material-icons-round">qr_code_scanner</span> Mulai Scan QR
            </button>
            
            <Link 
              to="/" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--on-surface-variant)', 
                fontSize: '0.85rem', 
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'var(--transition)'
              }}
              className="back-home-link"
            >
              <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
              Kembali ke Beranda
            </Link>
          </Reveal>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <QRScannerModal 
          onSuccess={handleAuthSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .back-home-link:hover {
          color: #fff;
          transform: translateX(-4px);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
