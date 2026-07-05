import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { useNotification } from '../../context/NotificationContext';
import { apiFetch } from '../../utils/api';

interface FinanceRecord {
  id: string;
  ucid: string;
  jenis_iuran: string;
  nominal: number;
  status: string;
  date: string;
}

export const Keuangan: React.FC = () => {
  const { showNotification } = useNotification();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [formData, setFormData] = useState({ ucid: '', jenis_iuran: 'Kas Bulanan', nominal: 20000, status: 'Lunas' });
  const [displayNominal, setDisplayNominal] = useState('20.000');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(window.innerWidth > 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRecords = async () => {
    try {
      const res = await apiFetch('/api/finance');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }

    } catch (err) {
      console.error('Error fetching finance records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Ambil angka saja
    const num = parseInt(val) || 0;
    setFormData({ ...formData, nominal: num });
    setDisplayNominal(num.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/finance', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showNotification('success', 'Transaksi Disimpan', 'Data transaksi baru telah berhasil dicatat dalam kas lingkungan.');
        setFormData({ ucid: '', jenis_iuran: 'Kas Bulanan', nominal: 20000, status: 'Lunas' });
        setDisplayNominal('20.000');
        fetchRecords();
      }
    } catch (err) {
      console.error('Error saving record:', err);
      showNotification('error', 'Gagal Mencatat', 'Terjadi kesalahan saat menyimpan data transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/finance/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showNotification('info', 'Status Diperbarui', 'Status pembayaran telah berhasil diperbarui.');
        fetchRecords();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const totalKas = records
    .filter(r => r.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0 }}>Iuran & Kas Lingkungan</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Manajemen keuangan dan transparansi kas Karang Taruna.</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 24px', textAlign: 'right', border: '1px solid var(--color-green)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-green)', fontWeight: 700, letterSpacing: '1px' }}>TOTAL KAS TERKUMPUL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{formatIDR(totalKas)}</div>
          </div>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }} className="md:grid-cols-1">
        <Reveal className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons-round text-pink-500">add_card</span>
              Input Transaksi Baru
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
              <label className="form-label">UCID Warga / Keterangan</label>
              <input
                type="text"
                className="form-input"
                placeholder="TARA-001 atau Nama Warga"
                value={formData.ucid}
                onChange={(e) => setFormData({ ...formData, ucid: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jenis Iuran</label>
              <select
                className="form-select form-input"
                value={formData.jenis_iuran}
                onChange={(e) => setFormData({ ...formData, jenis_iuran: e.target.value })}
              >
                <option value="Kas Bulanan">Kas Bulanan</option>
                <option value="Iuran Sampah">Iuran Sampah</option>
                <option value="Donasi Sosial">Donasi Sosial</option>
                <option value="Pengeluaran">Pengeluaran (Operasional)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nominal</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  className="form-input"
                  value={displayNominal}
                  onChange={handleNominalChange}
                  required
                  style={{ paddingLeft: '48px' }}
                />
                <span style={{ position: 'absolute', left: '16px', color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '0.85rem' }}>Rp</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Lunas">Lunas</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
            </form>
          </div>
        </Reveal>

        <Reveal className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Riwayat Transaksi</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 700 }}>PAGE {currentPage} OF {totalPages}</span>
          </div>
          <div className="desktop-only">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>TANGGAL</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>WARGA/DESC</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>KATEGORI</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>NOMINAL</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--outline)' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px' }}><div className="skeleton-box" style={{ width: '80px', height: '14px' }}></div></td>
                        <td style={{ padding: '12px' }}><div className="skeleton-box" style={{ width: '120px', height: '14px' }}></div></td>
                        <td style={{ padding: '12px' }}><div className="skeleton-box" style={{ width: '100px', height: '14px' }}></div></td>
                        <td style={{ padding: '12px' }}><div className="skeleton-box" style={{ width: '80px', height: '14px' }}></div></td>
                        <td style={{ padding: '12px' }}><div className="skeleton-box" style={{ width: '60px', height: '14px' }}></div></td>
                      </tr>
                    ))
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Belum ada riwayat transaksi.</td>
                    </tr>
                  ) : (
                    currentItems.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{r.ucid}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{r.jenis_iuran}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem', color: r.jenis_iuran === 'Pengeluaran' ? '#f87171' : '#34d399' }}>
                          {r.jenis_iuran === 'Pengeluaran' ? '-' : '+'}{formatIDR(r.nominal)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={r.status}
                            onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: r.status === 'Lunas' ? '#34d399' : '#fbbf24', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <option value="Lunas">LUNAS</option>
                            <option value="Belum Bayar">BELUM BAYAR</option>
                            <option value="Menunggu Verifikasi">PROSES</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only-flex" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-box" style={{ width: '40%', height: '12px', marginBottom: '8px' }}></div>
                  <div className="skeleton-box" style={{ width: '70%', height: '16px', marginBottom: '12px' }}></div>
                  <div className="skeleton-box" style={{ width: '50%', height: '12px' }}></div>
                </div>
              ))
            ) : currentItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Belum ada riwayat transaksi.</div>
            ) : (
              currentItems.map((r) => (
                <div key={r.id} className="mobile-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{new Date(r.date).toLocaleDateString('id-ID')}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.status === 'Lunas' ? '#34d399' : '#fbbf24' }}>{r.status.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{r.ucid}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.jenis_iuran}</span>
                    <span style={{ fontWeight: 700, color: r.jenis_iuran === 'Pengeluaran' ? '#f87171' : '#34d399' }}>
                      {r.jenis_iuran === 'Pengeluaran' ? '-' : '+'}{formatIDR(r.nominal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_left</span> Sebelumnya
            </button>
            <div style={{ color: 'var(--outline)', fontSize: '0.9rem', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Selanjutnya <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
