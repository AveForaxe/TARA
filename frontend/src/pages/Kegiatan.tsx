import React, { useState, useEffect } from 'react';
import { Reveal } from '../components/Reveal';
import { useNotification } from '../context/NotificationContext';
import { apiFetch, getApiBaseUrl } from '../utils/api';

interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  status: string;
}

export const Kegiatan: React.FC = () => {
  const { showNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState({ nama: '', phone: '', alamat: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openRegister = (ev: EventData) => {
    setSelectedEvent(ev);
    setFormData({ nama: '', phone: '', alamat: '' });
    setShowModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/events/${selectedEvent.id}/register`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        showNotification('success', 'Pendaftaran Berhasil', 'Anda telah terdaftar! Sampai jumpa di kegiatan.');
      } else {
        showNotification('error', 'Gagal Mendaftar', data.message || 'Terjadi kesalahan.');
      }
    } catch {
      showNotification('error', 'Kesalahan Koneksi', 'Tidak dapat menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="container">
          <Reveal>
            <span className="section-badge">KARANG TARUNA EVENTS</span>
            <h1>Celebrating the Spirit of <span className="text-gradient">Independence</span></h1>
            <p>Digitalizing tradition for the next generation. Join the annual Karang Taruna championships and showcase your skills.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Featured Event (Always show the first upcoming event if available) */}
          {events.length > 0 && (
            <div className="glass-card featured-event-card" style={{ marginBottom: '32px', padding: '32px', position: 'relative', overflow: 'hidden', borderColor: 'rgba(255,77,141,0.3)', background: 'linear-gradient(135deg,rgba(255,77,141,0.08),rgba(31,32,34,0.6))' }}>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <span className="section-badge">UNGGULAN • {new Date(events[0].date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                  <h2 style={{ color: '#fff', margin: '12px 0' }}>{events[0].title}</h2>
                  <p style={{ color: 'var(--on-surface-variant)', marginBottom: '20px' }}>{events[0].description}</p>
                  <div className="event-meta" style={{ marginBottom: '24px' }}>
                    <span className="event-meta-item"><span className="material-icons-round">location_on</span> {events[0].location}</span>
                    <span className="event-meta-item"><span className="material-icons-round">groups</span> Kapasitas Terbatas</span>
                    <span className="event-meta-item"><span className="material-icons-round">emoji_events</span> Reward Digital</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => openRegister(events[0])}>
                      <span className="material-icons-round">qr_code_scanner</span> Daftar via QR
                    </button>
                  </div>
                </div>
                <div className="featured-qr-placeholder" style={{ width: '180px', height: '180px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                  <span className="material-icons-round" style={{ fontSize: '72px', color: 'var(--primary)', marginBottom: '8px' }}>qr_code_2</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Scan untuk Daftar</span>
                </div>
              </div>
            </div>
          )}

          {/* Event Cards Grid */}
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">Semua <span className="text-gradient">Kegiatan</span></h2>
          </div>
          <div className="events-preview-grid">
            {events.length === 0 ? (
              <div className="glass-card" style={{ padding: '64px', textAlign: 'center', gridColumn: '1 / -1', opacity: 0.6 }}>
                <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>event_busy</span>
                <p>Belum ada jadwal kegiatan saat ini. Pantau terus untuk pembaruan!</p>
              </div>
            ) : (
              events.map((event, i) => {
                const dateObj = new Date(event.date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                
                return (
                  <Reveal key={i} className="event-preview-card glass-card">
                    <div className="event-preview-date"><span className="event-day">{day}</span><span className="event-month">{month}</span></div>
                    <h3>{event.title}</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '16px', flex: 1, lineHeight: 1.6 }}>{event.description.substring(0, 100)}...</p>
                    <div className="event-meta" style={{ marginTop: 'auto', marginBottom: '24px' }}>
                      <span className="event-meta-item"><span className="material-icons-round">location_on</span> {event.location}</span>
                    </div>
                    <button className="btn btn-glass btn-sm" style={{ alignSelf: 'flex-start', borderRadius: '20px', padding: '8px 20px' }} onClick={() => openRegister(event)}>Daftar Sekarang</button>
                  </Reveal>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(7, 11, 20, 0.8)', backdropFilter: 'blur(12px)', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <Reveal className="glass-card" style={{ maxWidth: '480px', width: '100%', position: 'relative', padding: '40px', border: '1px solid rgba(255, 77, 141, 0.2)' }}>
            <button 
              onClick={() => setShowModal(false)} 
              className="btn-icon" 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)' }}
            >
              <span className="material-icons-round">close</span>
            </button>

            <div className="modal-header">
              <div className="logo-icon" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '24px' }}>
                <span className="material-icons-round">event_available</span>
              </div>
              <h3 className="text-gradient">Daftar: {selectedEvent?.title}</h3>
              <p>Lengkapi data diri Anda untuk mendapatkan akses eksklusif ke kegiatan ini.</p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div className="input-icon-wrapper">
                <input type="text" className="form-input" placeholder="Masukkan nama lengkap" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
                <span className="material-icons-round">person</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nomor HP / WhatsApp</label>
              <div className="input-icon-wrapper">
                <input type="tel" className="form-input" placeholder="08xxxxxxxxxx" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                <span className="material-icons-round">phone_iphone</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alamat (RT/RW)</label>
              <div className="input-icon-wrapper">
                <input type="text" className="form-input" placeholder="Contoh: RT 05 / RW 02" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} required />
                <span className="material-icons-round">location_on</span>
              </div>
            </div>

            <div style={{ margin: '24px 0' }}>
              <button type="submit" className="btn btn-primary btn-premium" disabled={submitting}>
                <span className="material-icons-round">how_to_reg</span> {submitting ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </div>
            </form>

            <div style={{ textAlign: 'center', opacity: 0.6 }}>
              <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span className="material-icons-round" style={{ fontSize: '14px' }}>verified_user</span>
                Data Anda aman & terenkripsi secara digital.
              </p>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
};
