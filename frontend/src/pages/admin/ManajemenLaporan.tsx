import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { apiFetch } from '../../utils/api';

interface Report {
  _id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  reporter_ucid: string;
  createdAt: string;
}

export const ManajemenLaporan: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/reports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }

    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan ini secara permanen?')) return;
    try {
      const res = await apiFetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const adminUserStr = sessionStorage.getItem('tara_admin_user');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const currentRole = adminUser?.role || 'ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return '#10b981';
      case 'Ditindaklanjuti': return '#fcd34d';
      case 'Diproses': return '#fbbf24';
      default: return '#f87171';
    }
  };

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255, 77, 141, 0.1)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: 'var(--cyber-pink)' }}>
            <span className="material-icons-round">history</span>
          </div>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Laporan Terkini</h2>
            <p style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '0.9rem' }}>Daftar laporan yang sedang diproses oleh tim Karang Taruna Digital.</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <span className="section-badge" style={{ margin: 0 }}>{reports.length} LAPORAN TOTAL</span>
        </div>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card" style={{ height: '180px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '10px' }}></div>
                <div className="skeleton-box" style={{ width: '80px', height: '14px' }}></div>
              </div>
              <div className="skeleton-box" style={{ width: '40%', height: '24px' }}></div>
              <div className="skeleton-box" style={{ width: '90%', height: '14px' }}></div>
              <div className="skeleton-box" style={{ width: '80%', height: '14px' }}></div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '20px' }}>
                <div className="skeleton-box" style={{ width: '100px', height: '12px' }}></div>
                <div className="skeleton-box" style={{ width: '100px', height: '12px' }}></div>
              </div>
            </div>
          ))
        ) : currentItems.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>fact_check</span>
            Belum ada laporan dari warga.
          </div>
        ) : (
          currentItems.map((r) => (
            <Reveal key={r._id} className="glass-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 800, 
                      padding: '4px 8px', 
                      borderRadius: '20px', 
                      background: `${getStatusColor(r.status)}15`, 
                      color: getStatusColor(r.status),
                      border: `1px solid ${getStatusColor(r.status)}30`,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: getStatusColor(r.status) }}></div>
                      {r.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>
                      {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '6px', fontWeight: 700 }}>{r.title}</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px' }}>{r.description}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--outline)' }}>location_on</span> {r.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--outline)' }}>category</span> {r.category}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--outline)' }}>person</span> {r.reporter_ucid}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>TINDAKAN {currentRole}</label>
                  <select 
                    value={r.status}
                    onChange={(e) => handleUpdateStatus(r._id, e.target.value)}
                    style={{ 
                      background: '#161719', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff', 
                      padding: '8px 10px', 
                      borderRadius: '10px', 
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <button 
                    onClick={() => handleDelete(r._id)}
                    style={{ 
                      marginTop: '4px',
                      background: 'rgba(248, 113, 113, 0.05)', 
                      border: '1px solid rgba(248, 113, 113, 0.1)', 
                      color: '#f87171', 
                      padding: '8px 10px', 
                      borderRadius: '10px', 
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span className="material-icons-round" style={{ fontSize: '16px' }}>delete</span> Hapus Laporan
                  </button>
                </div>
              </div>
            </Reveal>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Reveal style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              borderRadius: '12px', 
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <span className="material-icons-round">chevron_left</span> Sebelumnya
          </button>
          
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            {currentPage} <span style={{ color: 'var(--outline)', margin: '0 8px' }}>/</span> {totalPages}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              borderRadius: '12px', 
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Selanjutnya <span className="material-icons-round">chevron_right</span>
          </button>
        </Reveal>
      )}
    </div>
  );
};
