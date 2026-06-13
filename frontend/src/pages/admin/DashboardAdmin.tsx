import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { ADMIN_PATH } from '../../utils/constants';

export const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWarga: 0,
    totalLaporan: 0,
    kasBulanIni: 'Rp 0',
    eventMendatang: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes, eventsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/reports'),
        apiFetch('/api/events')
      ]);
      
      if (!statsRes.ok || !reportsRes.ok || !eventsRes.ok) {
        console.warn('Dashboard data fetch partially or fully failed');
      }

      const statsData = statsRes.ok ? await statsRes.json() : {};
      const reportsData = reportsRes.ok ? await reportsRes.json() : [];
      const eventsData = eventsRes.ok ? await eventsRes.json() : [];

      const safeStats = {
        totalWarga: statsData.totalWarga || 0,
        totalLaporan: statsData.totalLaporan || 0,
        kasBulanIni: (statsData.kasBulanIni || 0).toLocaleString('id-ID'),
        eventMendatang: statsData.eventMendatang || 0
      };

      setStats({
        totalWarga: safeStats.totalWarga,
        totalLaporan: safeStats.totalLaporan,
        kasBulanIni: `Rp ${safeStats.kasBulanIni}`,
        eventMendatang: safeStats.eventMendatang
      });

      if (Array.isArray(reportsData)) {
        setRecentActivities(reportsData.slice(0, 5));
      }
      
      if (Array.isArray(eventsData)) {
        const upcoming = eventsData.filter((e: any) => e.status === 'Mendatang')[0];
        setFeaturedEvent(upcoming || null);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Warga', value: stats.totalWarga.toLocaleString(), icon: 'people', color: '#60a5fa' },
    { label: 'Laporan Baru', value: stats.totalLaporan, icon: 'feedback', color: '#f87171' },
    { label: 'Kas Bulan Ini', value: stats.kasBulanIni, icon: 'payments', color: '#34d399' },
    { label: 'Event Mendatang', value: stats.eventMendatang, icon: 'event', color: '#fbbf24' },
  ];

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h2 style={{ color: '#fff', marginBottom: '4px' }}>Dashboard Pengurus</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>Selamat datang kembali, berikut statistik lingkungan hari ini.</p>
          </div>
          <button 
            onClick={fetchData}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span> Segarkan
          </button>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <Reveal key={i} delay={i * 0.1} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
              </div>
              <div style={{ width: '40px', height: '40px', background: `${stat.color}15`, color: stat.color, borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                <span className="material-icons-round">{stat.icon}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {featuredEvent && (
        <Reveal style={{ marginBottom: '32px' }}>
          <div 
            className="glass-card" 
            style={{ 
              padding: '24px', 
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#3b82f6', borderRadius: '16px', display: 'grid', placeItems: 'center', color: '#fff' }}>
                <span className="material-icons-round" style={{ fontSize: '32px' }}>campaign</span>
              </div>
              <div>
                <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>EVENT TERDEKAT</div>
                <h3 style={{ color: '#fff', margin: 0 }}>{featuredEvent.title}</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  {new Date(featuredEvent.date).toLocaleDateString('id-ID', { dateStyle: 'long' })} • {featuredEvent.location}
                </p>
              </div>
            </div>
            <button 
              className="btn"
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px' }}
              onClick={() => navigate(`${ADMIN_PATH}/kegiatan`)}
            >Kelola Event</button>
          </div>
        </Reveal>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="md:grid-cols-1">
        <Reveal className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-icons-round text-blue-500">history</span> Laporan Warga Terbaru
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Belum ada laporan masuk.</div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: activity.status === 'Selesai' ? '#34d399' : '#3b82f6' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{activity.title}</div>
                    <div style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>
                      {activity.reporter_ucid} • {new Date(activity.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="status-badge" style={{ fontSize: '0.7rem' }}>{activity.status}</span>
                </div>
              ))
            )}
          </div>
        </Reveal>

        <Reveal className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: '#fff', marginBottom: '20px' }}>Akses Cepat</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { name: 'Warga', icon: 'badge', path: `${ADMIN_PATH}/warga` },
              { name: 'Keuangan', icon: 'payments', path: `${ADMIN_PATH}/keuangan-data` },
              { name: 'Laporan', icon: 'report_problem', path: `${ADMIN_PATH}/laporan` },
              { name: 'Kegiatan', icon: 'event', path: `${ADMIN_PATH}/kegiatan` },
              { name: 'Logs', icon: 'security', path: `${ADMIN_PATH}/logs` },
            ].map((m, k) => (
              <button 
                key={k} 
                onClick={() => navigate(m.path || '#')}
                style={{ padding: '16px', background: '#161719', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}
              >
                <span className="material-icons-round" style={{ color: '#3b82f6' }}>{m.icon}</span>
                <span style={{ fontSize: '0.75rem' }}>{m.name}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};
