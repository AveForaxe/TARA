import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

export const DashboardKeuangan: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const adminUserStr = sessionStorage.getItem('tara_admin_user');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const currentUcid = adminUser?.ucid || '';

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/logs')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalSaldo: `Rp ${data.keuangan.totalSaldo.toLocaleString('id-ID')}`,
          iuranBulanIni: `Rp ${data.keuangan.iuranBulanIni.toLocaleString('id-ID')}`,
          pengeluaranBulanIni: `Rp ${data.keuangan.pengeluaranBulanIni.toLocaleString('id-ID')}`,
          wargaBelumBayar: data.keuangan.wargaBelumBayar
        });
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (Array.isArray(logsData)) {
          // Only show logs for current Keuangan user
          setLogs(logsData.filter(log => log.actor_ucid === currentUcid));
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 8px 0' }}>Dashboard Keuangan</h1>
          <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Ringkasan Kas & Iuran Warga</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span className={`material-icons-round ${isRefreshing ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>sync</span> Refresh
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ background: '#111214', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#10b981' }}>
            <span className="material-icons-round">account_balance_wallet</span>
            <span style={{ fontWeight: 600 }}>Total Saldo Kas</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.totalSaldo || '-'}</div>
        </div>
        
        <div style={{ background: '#111214', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#3b82f6' }}>
            <span className="material-icons-round">trending_up</span>
            <span style={{ fontWeight: 600 }}>Pemasukan Bulan Ini</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.iuranBulanIni || '-'}</div>
        </div>

        <div style={{ background: '#111214', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
            <span className="material-icons-round">trending_down</span>
            <span style={{ fontWeight: 600 }}>Pengeluaran Bulan Ini</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.pengeluaranBulanIni || '-'}</div>
        </div>

        <div style={{ background: '#111214', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#f59e0b' }}>
            <span className="material-icons-round">warning</span>
            <span style={{ fontWeight: 600 }}>Menunggak Iuran</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.wargaBelumBayar || '0'} Warga</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons-round text-pink-500">history</span>
          Log Aktivitas Keuangan
        </h3>
        {logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            Belum ada aktivitas transaksi yang Anda lakukan.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="material-icons-round" style={{ color: 'var(--outline)' }}>receipt_long</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{log.action}</div>
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                    {log.details ? JSON.stringify(log.details) : ''}
                  </div>
                </div>
                <div style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>
                  {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
