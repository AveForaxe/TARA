import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { QRCodeSVG } from 'qrcode.react';
import { useNotification } from '../../context/NotificationContext';
import { apiFetch } from '../../utils/api';

interface Citizen {
  _id: string;
  ucid: string;
  nama: string;
  blok: string;
  role: string;
  qrToken: string;
  isActivated: boolean;
}

export const DataWarga: React.FC = () => {
  const { showNotification } = useNotification();
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [formData, setFormData] = useState({ nama: '', blok: '', role: 'WARGA' });
  const [loading, setLoading] = useState(false);

  const adminUserStr = sessionStorage.getItem('tara_admin_user');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const currentRole = adminUser?.role || 'WARGA';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(window.innerWidth > 768);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/users');
      const data = await res.json();
      
      if (res.ok) {
        if (Array.isArray(data)) {
          setCitizens(data);
        } else {
          console.warn('Expected array for citizens, got:', data);
          setCitizens([]);
        }
      } else {
        showNotification('error', 'Gagal Memuat', data.message || 'Anda tidak memiliki izin untuk melihat data ini.');
        setCitizens([]);
      }
    } catch (err) {
      console.error('Error fetching citizens:', err);
      showNotification('error', 'Kesalahan Koneksi', 'Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId 
        ? `/api/users/${editingId}` 
        : `/api/users`;
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification(
          'success', 
          editingId ? 'Data Diperbarui' : 'Warga Terdaftar', 
          editingId ? 'Informasi warga telah berhasil diperbarui.' : 'Warga baru telah berhasil didaftarkan ke sistem.'
        );
        setFormData({ nama: '', blok: '', role: 'WARGA' });
        setEditingId(null);
        fetchCitizens();
      } else {
        const errorData = await res.json();
        showNotification('error', 'Gagal Menyimpan', errorData.message || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (err) {
      console.error('Error saving citizen:', err);
      showNotification('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data warga.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Citizen) => {
    setEditingId(c._id);
    setFormData({ nama: c.nama, blok: c.blok, role: c.role });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data warga ini?')) return;
    try {
      const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Warga Dihapus', 'Data warga telah berhasil dihapus dari sistem.');
        fetchCitizens();
      }
    } catch (err) {
      console.error('Error deleting citizen:', err);
      showNotification('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus data warga.');
    }
  };

  const handleRegenerateQR = async (id: string) => {
    if (!confirm('Token QR lama akan hangus. Lanjutkan regenerasi?')) return;
    try {
      const res = await apiFetch(`/api/users/${id}/regenerate`, { method: 'POST' });
      if (res.ok) {
        showNotification('success', 'QR Diperbarui', 'Token QR baru telah berhasil dibuat.');
        fetchCitizens();
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error regenerating token:', err);
      showNotification('error', 'Gagal Regenerasi', 'Terjadi kesalahan saat membuat token QR baru.');
    }
  };

  const openQRModal = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setShowModal(true);
  };

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Manajemen Data Warga</h2>
          <span className="section-badge" style={{ margin: 0 }}>{citizens.length} TOTAL WARGA</span>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }} className="md:grid-cols-1">
        {/* Form Input */}
        <Reveal className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px', border: editingId ? '1px solid var(--cyber-pink)' : '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons-round text-pink-500">{editingId ? 'edit' : 'person_add'}</span>
              {editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}
            </h3>
            <button 
              className="btn-icon mobile-only-flex"
              style={{ display: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <span className="material-icons-round">{isFormOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
          </div>
          
          <div style={{ display: isFormOpen ? 'block' : 'none' }}>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blok Rumah</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: A1/12"
                value={formData.blok}
                onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role / Jabatan</label>
              <select 
                className="form-select form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {(() => {
                  if (currentRole === 'KARANG TARUNA') {
                    return <option value="KARANG TARUNA">Karang Taruna</option>;
                  }

                  let options = [
                    { value: 'WARGA', label: 'Warga Biasa' },
                    { value: 'KARANG TARUNA', label: 'Karang Taruna' },
                    { value: 'KEUANGAN', label: 'Seksi Keuangan' }
                  ];

                  if (currentRole === 'ADMINISTRATOR' || currentRole === 'DEVELOPER') {
                    options.push({ value: 'ADMINISTRATOR', label: 'Administrator' });
                    options.push({ value: 'KETUA RT', label: 'Ketua RT' });
                  }

                  if (currentRole === 'DEVELOPER') {
                    options.push({ value: 'DEVELOPER', label: 'Developer' });
                  }

                  return options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ));
                })()}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Memproses...' : (editingId ? 'Simpan Perubahan' : 'Daftarkan Warga')}
              </button>
              {editingId && (
                <button 
                  type="button"
                  className="btn" 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ nama: '', blok: '', role: 'WARGA' });
                  }}
                >
                  Batal
                </button>
              )}
            </div>
            </form>
          </div>
        </Reveal>

        {/* List Warga */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ height: '84px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="skeleton-box" style={{ width: '52px', height: '52px', borderRadius: '16px' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-box" style={{ width: '40%', height: '18px', marginBottom: '8px' }}></div>
                  <div className="skeleton-box" style={{ width: '20%', height: '12px' }}></div>
                </div>
                <div className="skeleton-box" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
                <div className="skeleton-box" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
              </div>
            ))
          ) : citizens.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              Belum ada data warga terdaftar.
            </div>
          ) : (
            citizens.filter(c => (currentRole === 'DEVELOPER' || currentRole === 'ADMINISTRATOR') ? true : c.role !== 'DEVELOPER').map((c) => (
              <Reveal key={c._id} className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Avatar Icon */}
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(232,121,160,0.1), rgba(110,231,183,0.1))',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--cyber-pink)',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span className="material-icons-round" style={{ fontSize: '28px' }}>person</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      color: 'var(--on-surface-variant)', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 700, 
                      letterSpacing: '0.05em' 
                    }}>
                      {c.ucid}
                    </span>
                    {c.isActivated ? (
                      <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> AKTIF
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.6rem', color: 'var(--outline)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--outline)' }}></div> MENUNGGU
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>{c.nama}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--outline)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '14px' }}>home</span> {c.blok}
                    </span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                    <span style={{ 
                      color: c.role === 'ADMINISTRATOR' ? 'var(--cyber-pink)' : 'var(--outline)',
                      fontWeight: c.role === 'ADMINISTRATOR' ? 700 : 400
                    }}>
                      {c.role}
                    </span>
                  </div>
                </div>
                
                {(currentRole === 'DEVELOPER' || currentRole === 'ADMINISTRATOR') && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => openQRModal(c)}
                      className="action-btn"
                      title="Cetak QR"
                      style={{ background: 'rgba(216, 150, 167, 0.08)', color: 'var(--cyber-pink)', borderColor: 'rgba(216, 150, 167, 0.15)' }}
                    >
                      <span className="material-icons-round">qr_code_2</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(c)}
                      className="action-btn"
                      title="Edit Data"
                      style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#fff' }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="action-btn"
                      title="Hapus Warga"
                      style={{ background: 'rgba(248, 113, 113, 0.05)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.1)' }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '18px' }}>delete_outline</span>
                    </button>
                  </div>
                )}
              </Reveal>
            ))
          )}
        </div>
      </div>

      <style>{`
        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .action-btn span {
          font-size: 20px;
        }
      `}</style>

      {/* Modal QR */}
      {showModal && selectedCitizen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <Reveal className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>QR Identity Warga</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginBottom: '24px' }}>Scan untuk aktivasi perangkat warga.</p>
            <Reveal delay={0.1}>
            <div style={{ 
              background: '#fff', 
              padding: '16px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <QRCodeSVG 
                value={JSON.stringify({ ucid: selectedCitizen.ucid, token: selectedCitizen.qrToken })} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            </Reveal>

            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>{selectedCitizen.nama}</div>
            <div style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>{selectedCitizen.ucid}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>Cetak QR</button>
                <button 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--outline)', color: '#fff', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              </div>
              
              <button 
                onClick={() => handleRegenerateQR(selectedCitizen._id)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(248, 113, 113, 0.05)', 
                  border: '1px solid rgba(248, 113, 113, 0.2)', 
                  color: '#f87171', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span>
                Regenerasi Token QR
              </button>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
};
