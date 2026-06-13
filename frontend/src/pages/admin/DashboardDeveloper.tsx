import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

interface AuditLog {
  _id: string;
  timestamp: string;
  actor_ucid: string;
  actor_role: string;
  actor_name?: string;
  action: string;
  details: string;
}

export const DashboardDeveloper: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/logs')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.developer);
      }
      
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching developer data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 8px 0' }}>Master Dashboard</h1>
          <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Super Admin Controls & System Overview</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="material-icons-round" style={{ 
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            fontSize: '18px'
          }}>sync</span>
          {isRefreshing ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Stat Cards */}
        <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backdropFilter: 'blur(var(--blur))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-blue)' }}>
            <span className="material-icons-round">admin_panel_settings</span>
            <span style={{ fontWeight: 600 }}>Total Administrator</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{stats?.totalAdmin || '0'}</div>
        </div>
        
        <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backdropFilter: 'blur(var(--blur))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-green)' }}>
            <span className="material-icons-round">assignment_ind</span>
            <span style={{ fontWeight: 600 }}>Total Ketua RT</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{stats?.totalRT || '0'}</div>
        </div>

        <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backdropFilter: 'blur(var(--blur))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-amber)' }}>
            <span className="material-icons-round">groups</span>
            <span style={{ fontWeight: 600 }}>Total Karang Taruna</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{stats?.totalKT || '0'}</div>
        </div>

        <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backdropFilter: 'blur(var(--blur))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-pink)' }}>
            <span className="material-icons-round">people</span>
            <span style={{ fontWeight: 600 }}>Total Warga Biasa</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{stats?.totalWargaBiasa || '0'}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons-round text-pink-500">public</span>
          Global Audit Log
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>WAKTU</th>
                <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>IDENTITAS</th>
                <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>TINDAKAN</th>
                <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>METADATA / DETAIL</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Memuat log sistem...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Belum ada log sistem.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{log.actor_name || log.actor_ucid}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>{log.actor_role}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      <span style={{ 
                        background: 'rgba(255, 77, 141, 0.1)', 
                        color: 'var(--color-pink)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
