import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { useNotification } from '../context/NotificationContext';
import { apiFetch } from '../utils/api';

interface ReportData {
  id?: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
}

export const Lapor: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [hoverUpload, setHoverUpload] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  // Ambil data laporan dari backend
  const fetchReports = async () => {
    const token = localStorage.getItem('tara_token');
    if (!token) return;

    try {
      const response = await apiFetch('/api/reports/my');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Gagal mengambil laporan:', err);
    }
  };

  const hasNotified = React.useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('tara_token');
    if (!token) {
      if (!hasNotified.current) {
        showNotification('warning', 'Akses Terbatas', 'Silakan Scan QR di Dasbor untuk masuk.');
        hasNotified.current = true;
      }
      navigate('/dasbor');
      return;
    }
    fetchReports();
  }, [navigate, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.title || !formData.description || !formData.location) {
      showNotification('warning', 'Data Belum Lengkap', 'Mohon lengkapi semua data laporan.');
      return;
    }

    const token = localStorage.getItem('tara_token');
    const userStr = localStorage.getItem('tara_user');

    if (!token || !userStr) {
      showNotification('error', 'Akses Ditolak', 'Silakan login (scan QR) di Dasbor terlebih dahulu.');
      setLoading(false);
      return;
    }

    const userData = JSON.parse(userStr);

    try {
      const response = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          reporter_ucid: userData.ucid
        })
      });

      if (response.ok) {
        showNotification('success', 'Laporan Terkirim', 'Laporan Anda telah berhasil dikirim ke tim Karang Taruna.');
        setFormData({ category: '', title: '', description: '', location: '' });
        fetchReports(); // Refresh daftar laporan
      } else {
        showNotification('error', 'Pengiriman Gagal', 'Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Error:', err);
      showNotification('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Ditindaklanjuti': return 'status-progress';
      case 'Selesai': return 'status-resolved';
      case 'Diproses': return 'status-pending';
      default: return 'status-open';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ditindaklanjuti': return 'autorenew';
      case 'Selesai': return 'check_circle';
      case 'Diproses': return 'schedule';
      default: return 'error';
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="container">
          <Reveal>
            <span className="section-badge">CITIZEN ISSUE TRACKER</span>
            <h1>Lapor <span className="text-gradient">Warga</span></h1>
            <p>Suarakan aspirasi dan laporkan kendala di lingkungan Anda. Bersama kita bangun komunitas yang lebih responsif dan transparan.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Report Form */}
            <Reveal className="glass-card" style={{ minWidth: 0, padding: '24px', height: 'fit-content' }}>
              <div className="modal-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span className="material-icons-round" style={{ background: 'rgba(255,77,141,0.15)', padding: '8px', borderRadius: '12px', fontSize: '24px' }}>edit_note</span> 
                  Buat Laporan Baru
                </h3>
                <p style={{ fontSize: '0.85rem' }}>Bantu kami meningkatkan kualitas lingkungan dengan melaporkan kendala yang Anda temukan.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Kategori Laporan</label>
                <div className="input-icon-wrapper">
                  <select 
                    className="form-select" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="Jalan & Drainase">Jalan & Drainase (Berlubang, Banjir)</option>
                    <option value="Sampah & Kebersihan">Sampah & Kebersihan Lingkungan</option>
                    <option value="Keamanan & Satpam">Keamanan & Layanan Satpam</option>
                    <option value="Penerangan Jalan">Lampu Jalan & Listrik Umum</option>
                    <option value="Parkir & Ketertiban">Parkir & Ketertiban Tetangga</option>
                    <option value="Fasilitas Umum">Fasilitas Umum (Balai, Masjid, Taman)</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                  <span className="material-icons-round">category</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Judul Laporan</label>
                <div className="input-icon-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ringkasan singkat masalah" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  <span className="material-icons-round">title</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Detail</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Jelaskan masalah secara detail agar memudahkan petugas..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ padding: '16px' }}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Kejadian</label>
                <div className="input-icon-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Depan Gapura RT 05" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <span className="material-icons-round">location_on</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Unggah Foto (Opsional)</label>
                <div 
                  style={{ 
                    border: `2px dashed ${hoverUpload ? 'var(--color-pink)' : 'var(--color-border)'}`, 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '40px 24px', 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    transition: 'var(--transition)',
                    background: hoverUpload ? 'rgba(255,77,141,0.03)' : 'rgba(255,255,255,0.02)'
                  }}
                  onMouseEnter={() => setHoverUpload(true)}
                  onMouseLeave={() => setHoverUpload(false)}
                >
                  <span className="material-icons-round" style={{ fontSize: '42px', color: hoverUpload ? 'var(--color-pink)' : 'var(--color-text-faint)', display: 'block', marginBottom: '12px', transition: 'var(--transition)' }}>cloud_upload</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 600 }}>Klik atau seret file foto ke sini</span><br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>Maksimal ukuran file 10MB (JPG, PNG)</span>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-premium" 
                onClick={handleSubmit}
                disabled={loading}
              >
                <span className="material-icons-round">{loading ? 'sync' : 'send'}</span> 
                {loading ? 'Sedang Mengirim...' : 'Kirim Laporan Sekarang'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '16px', background: 'rgba(110,231,183,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(110,231,183,0.1)' }}>
                <span className="material-icons-round" style={{ color: 'var(--color-green)', fontSize: '20px' }}>verified_user</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>Laporan Anda akan diproses secara anonim. Identitas Anda aman dalam enkripsi TARA.</span>
              </div>
            </Reveal>

            {/* Recent Reports */}
            <div style={{ minWidth: 0 }}>
              <Reveal>
                <div className="modal-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className="material-icons-round" style={{ background: 'rgba(79,195,247,0.15)', padding: '8px', borderRadius: '12px', fontSize: '24px', color: 'var(--color-blue)' }}>history</span> 
                    Laporan Terkini
                  </h3>
                  <p style={{ fontSize: '0.85rem' }}>Daftar laporan yang sedang diproses oleh tim Karang Taruna Digital.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentItems.length === 0 ? (
                    <div className="glass-card" style={{ padding: '48px', textAlign: 'center', opacity: 0.6 }}>
                      <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>inventory_2</span>
                      <p>Belum ada laporan masuk saat ini.</p>
                    </div>
                  ) : (
                    currentItems.map((report) => (
                      <div className="glass-card" style={{ padding: '16px 20px', border: '1px solid rgba(255,255,255,0.05)' }} key={report.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <span className={`status-badge ${getStatusClass(report.status)}`} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                            <span className="material-icons-round" style={{ fontSize: '12px' }}>{getStatusIcon(report.status)}</span> 
                            {report.status}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', fontWeight: 500 }}>
                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>{report.title}</h4>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.5 }}>{report.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>location_on</span> {report.location}
                          </span>
                          <span style={{ width: '3px', height: '3px', background: 'var(--color-border)', borderRadius: '50%' }}></span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>category</span> {report.category}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{ 
                        padding: '10px 20px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        borderRadius: '12px', 
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_left</span>
                    </button>
                    <div style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem', fontWeight: 600 }}>
                      {currentPage} / {totalPages}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{ 
                        padding: '10px 20px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        borderRadius: '12px', 
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
