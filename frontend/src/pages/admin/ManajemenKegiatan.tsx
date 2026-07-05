import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { useNotification } from '../../context/NotificationContext';
import { apiFetch } from '../../utils/api';

interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  status: string;
  proposal_url?: string;
}

export const ManajemenKegiatan: React.FC = () => {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<EventData[]>([]);
  const [formData, setFormData] = useState({ title: '', date: '', description: '', location: '', status: 'Mendatang', proposal_url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(window.innerWidth > 768);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }

    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId 
        ? `/api/events/${editingId}` 
        : '/api/events';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification(
          'success', 
          editingId ? 'Data Diperbarui' : 'Kegiatan Dibuat', 
          editingId ? 'Informasi kegiatan telah berhasil diperbarui.' : 'Kegiatan baru telah berhasil dipublikasikan.'
        );
        setFormData({ title: '', date: '', description: '', location: '', status: 'Mendatang', proposal_url: '' });
        setEditingId(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Error saving event:', err);
      showNotification('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ev: EventData) => {
    setEditingId(ev.id);
    setFormData({ 
      title: ev.title, 
      date: ev.date, 
      description: ev.description, 
      location: ev.location, 
      status: ev.status,
      proposal_url: ev.proposal_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;
    try {
      const res = await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Kegiatan Dihapus', 'Data kegiatan telah berhasil dihapus dari sistem.');
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      showNotification('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus data kegiatan.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Selesai': return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' };
      case 'Dibatalkan': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
      default: return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
    }
  };

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Manajemen Kegiatan</h2>
          <span className="section-badge" style={{ margin: 0 }}>{events.length} TOTAL EVENT</span>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }} className="md:grid-cols-1">
        {/* Form */}
        <Reveal className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons-round text-pink-500">{editingId ? 'edit_calendar' : 'add_event'}</span>
              {editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
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
              <label className="form-label">Judul Kegiatan</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Pelaksanaan</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lokasi</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea 
                className="form-textarea" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required 
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Link Proposal (Opsional)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://docs.google.com/..."
                value={formData.proposal_url}
                onChange={(e) => setFormData({ ...formData, proposal_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Mendatang">Mendatang</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Memproses...' : (editingId ? 'Simpan Perubahan' : 'Publish Kegiatan')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  onClick={() => { setEditingId(null); setFormData({ title: '', date: '', description: '', location: '', status: 'Mendatang', proposal_url: '' }); }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
          </div>
        </Reveal>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ height: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '10px' }}></div>
                  <div className="skeleton-box" style={{ width: '100px', height: '14px' }}></div>
                </div>
                <div className="skeleton-box" style={{ width: '50%', height: '24px' }}></div>
                <div className="skeleton-box" style={{ width: '30%', height: '14px' }}></div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              Belum ada agenda kegiatan terdaftar.
            </div>
          ) : (
            events.map((ev) => (
              <Reveal key={ev.id} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 800, 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      background: getStatusStyle(ev.status).bg, 
                      color: getStatusStyle(ev.status).color,
                      textTransform: 'uppercase'
                    }}>
                      {ev.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--outline)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-icons-round" style={{ fontSize: '16px' }}>calendar_today</span>
                      {new Date(ev.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>{ev.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    <span className="material-icons-round" style={{ fontSize: '16px' }}>location_on</span>
                    {ev.location}
                  </div>
                  {ev.proposal_url && (
                    <div style={{ marginTop: '8px' }}>
                      <a href={ev.proposal_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                        <span className="material-icons-round" style={{ fontSize: '14px' }}>link</span> Lihat Proposal
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleEdit(ev)}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    <span className="material-icons-round">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(ev.id)}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.1)', color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    <span className="material-icons-round">delete</span>
                  </button>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
