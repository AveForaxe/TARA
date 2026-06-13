import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { apiFetch } from '../../utils/api';

interface Log {
  _id: string;
  action: string;
  actor_ucid: string;
  timestamp: string;
  details: any;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await apiFetch('/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }

    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('Delete')) return 'delete_forever';
    if (action.includes('Update')) return 'edit_note';
    if (action.includes('Create') || action.includes('Tambah')) return 'add_circle';
    return 'info';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Delete')) return '#f87171';
    if (action.includes('Update')) return '#fbbf24';
    if (action.includes('Create') || action.includes('Tambah')) return '#34d399';
    return '#60a5fa';
  };

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0 }}>Log Audit Sistem</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Rekam jejak aktivitas pengurus dan perubahan data krusial.</p>
          </div>
          <button 
            onClick={fetchLogs}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span className="material-icons-round" style={{ fontSize: '18px' }}>sync</span> Refresh
          </button>
        </div>
      </Reveal>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Aktivitas Terbaru</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 700 }}>SHOWING LAST 100 ACTIONS</span>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Belum ada catatan aktivitas.</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log._id} 
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid rgba(255,255,255,0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: `${getActionColor(log.action)}15`, 
                  color: getActionColor(log.action),
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-icons-round">{getActionIcon(log.action)}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{log.action}</span>
                    <span style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>
                      {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--cyber-pink)', fontSize: '0.8rem', fontWeight: 700 }}>@{log.actor_ucid}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                      {log.details ? JSON.stringify(log.details).substring(0, 80) + '...' : 'No additional details'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
