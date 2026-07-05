import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_PATH, ROLES } from '../utils/constants';
import { AdminQRScannerModal } from './AdminQRScannerModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  const [isAuth, setIsAuth] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Cek session storage (No Cache)
    const token = sessionStorage.getItem('tara_admin_token');
    const user = sessionStorage.getItem('tara_admin_user');
    
    if (token && user) {
      setAdminUser(JSON.parse(user));
      setIsAuth(true);
    }

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setDbStatus('connected');
        else setDbStatus('disconnected');
      } catch {
        setDbStatus('disconnected');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (user: any, _token: string) => {
    setAdminUser(user);
    setIsAuth(true);
    
    // Auto-redirect to specific dashboard based on role
    switch (user.role) {
      case ROLES.DEVELOPER: navigate(`${ADMIN_PATH}/developer`); break;
      case ROLES.ADMINISTRATOR: navigate(`${ADMIN_PATH}/admin`); break;
      case ROLES.KEUANGAN: navigate(`${ADMIN_PATH}/keuangan`); break;
      case ROLES.KARANG_TARUNA: navigate(`${ADMIN_PATH}/karang-taruna`); break;
      case ROLES.KETUA_RT: navigate(`${ADMIN_PATH}/rt`); break;
      default: navigate(`${ADMIN_PATH}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tara_admin_token');
    sessionStorage.removeItem('tara_admin_user');
    setIsAuth(false);
    setAdminUser(null);
    navigate('/');
  };

  // Dinamis Sidebar Menu
  const allMenuItems = [
    { name: 'Master Dashboard', path: `${ADMIN_PATH}/developer`, icon: 'terminal', roles: [ROLES.DEVELOPER] },
    { name: 'Dashboard Admin', path: `${ADMIN_PATH}/admin`, icon: 'admin_panel_settings', roles: [ROLES.DEVELOPER, ROLES.ADMINISTRATOR] },
    { name: 'Keuangan', path: `${ADMIN_PATH}/keuangan`, icon: 'account_balance_wallet', roles: [ROLES.DEVELOPER, ROLES.KEUANGAN] },
    { name: 'Event Management', path: `${ADMIN_PATH}/karang-taruna`, icon: 'event', roles: [ROLES.DEVELOPER, ROLES.KARANG_TARUNA] },
    { name: 'Panel RT', path: `${ADMIN_PATH}/rt`, icon: 'holiday_village', roles: [ROLES.DEVELOPER, ROLES.KETUA_RT] },
    
    // Modul Data (Filtered)
    { name: 'Data Warga', path: `${ADMIN_PATH}/warga`, icon: 'people', roles: [ROLES.DEVELOPER, ROLES.ADMINISTRATOR, ROLES.KEUANGAN, ROLES.KARANG_TARUNA, ROLES.KETUA_RT] },
    { name: 'Data Keuangan', path: `${ADMIN_PATH}/keuangan-data`, icon: 'receipt_long', roles: [ROLES.DEVELOPER, ROLES.KEUANGAN] },
    { name: 'Data Kegiatan', path: `${ADMIN_PATH}/kegiatan`, icon: 'event_note', roles: [ROLES.DEVELOPER, ROLES.KARANG_TARUNA] },
    { name: 'Laporan Masuk', path: `${ADMIN_PATH}/laporan`, icon: 'report_problem', roles: [ROLES.DEVELOPER, ROLES.ADMINISTRATOR, ROLES.KETUA_RT] },
    { name: 'Produk Pasar', path: `${ADMIN_PATH}/produk`, icon: 'storefront', roles: [ROLES.DEVELOPER, ROLES.KARANG_TARUNA] },
    { name: 'Log Sistem', path: `${ADMIN_PATH}/logs`, icon: 'security', roles: [ROLES.DEVELOPER] },
  ];

  const filteredMenu = adminUser ? allMenuItems.filter(item => item.roles.includes(adminUser.role)) : [];

  if (!isAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(29,78,216,0.12) 0%, #070B14 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '700px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px',
              borderRadius: '18px', marginBottom: '18px', overflow: 'hidden',
            }}>
              <img src="/Tara-Icon.png" alt="TARA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{ color: '#f9fafb', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              TARA Admin Portal
            </h1>
            <p style={{ color: '#4b5563', fontSize: '0.88rem', maxWidth: '340px', margin: '0 auto', lineHeight: 1.6 }}>
              Gunakan QR Code identitas pengurus untuk mengakses sistem.
            </p>
          </div>

          {/* Scanner card */}
          <div style={{
            background: 'rgba(17,18,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: 'clamp(20px, 4vw, 36px)',
            backdropFilter: 'blur(20px)',
          }}>
            <AdminQRScannerModal onSuccess={handleAuthSuccess} />
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#1f2937', fontSize: '0.72rem', marginTop: '24px' }}>
            TARA · Karang Taruna Digital Hub
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c' }}>
      <aside 
        className="admin-sidebar"
        style={{ 
          width: isSidebarOpen ? '260px' : '80px', 
          background: '#111214', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <img src="/Tara-Icon.png" alt="TARA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {isSidebarOpen && <span style={{ fontWeight: 700, letterSpacing: '1px', color: '#fff', fontSize: '1.1rem' }}>TARA SYS</span>}
        </div>

        <nav style={{ padding: '16px', flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredMenu.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    borderRadius: '10px',
                    color: location.pathname === item.path ? '#3b82f6' : 'var(--on-surface-variant)',
                    background: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                  className="admin-nav-link"
                >
                  <span className="material-icons-round" style={{ fontSize: '22px' }}>{item.icon}</span>
                  {isSidebarOpen && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px', 
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}
          >
            <span className="material-icons-round">power_settings_new</span>
            {isSidebarOpen && <span>Tutup Sesi Admin</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '70px', 
          background: 'rgba(10, 10, 12, 0.8)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <span className="material-icons-round">menu_open</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
              background: dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              borderRadius: '20px', transition: 'all 0.5s ease'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dbStatus === 'connected' ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${dbStatus === 'connected' ? '#10b981' : '#ef4444'}` }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: dbStatus === 'connected' ? '#10b981' : '#ef4444', letterSpacing: '0.5px' }}>
                {dbStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{adminUser?.nama}</div>
              <div style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>{adminUser?.role}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #161719, #25262a)', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
              <span className="material-icons-round" style={{ color: '#3b82f6' }}>admin_panel_settings</span>
            </div>
          </div>
        </header>

        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav for Admin */}
      <nav className="bottom-nav" id="adminBottomNav" aria-label="Navigasi Utama">
        {filteredMenu.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.name}
            >
              <span className="material-icons-round bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label" style={{ fontSize: '0.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
