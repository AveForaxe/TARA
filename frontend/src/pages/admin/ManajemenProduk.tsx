import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/Reveal';
import { useNotification } from '../../context/NotificationContext';
import { apiFetch } from '../../utils/api';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  icon: string;
  isActive: boolean;
}

const CATEGORIES = ['FASHION', 'DIGITAL', 'JASA', 'KERAJINAN', 'MAKANAN'];
const ICONS = [
  { value: 'inventory_2', label: 'Box' },
  { value: 'palette', label: 'Seni' },
  { value: 'checkroom', label: 'Fashion' },
  { value: 'code', label: 'Digital' },
  { value: 'school', label: 'Edukasi' },
  { value: 'timer', label: 'Elektronik' },
  { value: 'headphones', label: 'Audio' },
  { value: 'restaurant', label: 'Makanan' },
  { value: 'handyman', label: 'Kerajinan' },
  { value: 'local_florist', label: 'Tanaman' },
  { value: 'sports_esports', label: 'Game' },
  { value: 'camera_alt', label: 'Foto' },
];

const formatIDR = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

const emptyForm = { title: '', category: 'FASHION', price: '', description: '', icon: 'inventory_2' };

export const ManajemenProduk: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(window.innerWidth > 768);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      showNotification('error', 'Kesalahan', 'Gagal memuat data produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ ...formData, price: parseInt(formData.price) || 0 }),
      });
      if (res.ok) {
        showNotification('success', editingId ? 'Produk Diperbarui' : 'Produk Ditambahkan',
          editingId ? 'Informasi produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan ke Pasar.');
        setFormData(emptyForm);
        setEditingId(null);
        fetchProducts();
      } else {
        const err = await res.json();
        showNotification('error', 'Gagal Menyimpan', err.message || 'Terjadi kesalahan.');
      }
    } catch {
      showNotification('error', 'Kesalahan Koneksi', 'Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({ title: p.title, category: p.category, price: String(p.price), description: p.description, icon: p.icon });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini secara permanen?')) return;
    const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showNotification('success', 'Produk Dihapus', 'Produk berhasil dihapus dari Pasar.');
      fetchProducts();
    }
  };

  const handleToggleActive = async (p: Product) => {
    const res = await apiFetch(`/api/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      showNotification('info', 'Status Diperbarui', `Produk ${!p.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
      fetchProducts();
    }
  };

  return (
    <div className="page-enter">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Manajemen Produk Pasar</h2>
          <span className="section-badge" style={{ margin: 0 }}>{products.length} PRODUK</span>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        {/* Form */}
        <Reveal className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px', border: editingId ? '1px solid var(--cyber-pink)' : '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons-round" style={{ color: 'var(--cyber-pink)' }}>{editingId ? 'edit' : 'add_box'}</span>
              {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <button className="btn-icon" style={{ display: window.innerWidth <= 768 ? 'flex' : 'none', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setIsFormOpen(!isFormOpen)}>
              <span className="material-icons-round">{isFormOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
          </div>

          <div style={{ display: isFormOpen ? 'block' : 'none' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Harga (Rp)</label>
                <div className="input-icon-wrapper">
                  <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} min="0" required style={{ paddingLeft: '48px' }} />
                  <span style={{ position: 'absolute', left: '16px', color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '0.85rem' }}>Rp</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Singkat</label>
                <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <select className="form-select form-input" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })}>
                  {ICONS.map(i => <option key={i.value} value={i.value}>{i.label} ({i.value})</option>)}
                </select>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                  <span className="material-icons-round" style={{ color: 'var(--cyber-pink)' }}>{formData.icon}</span>
                  Preview icon
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Produk')}
                </button>
                {editingId && (
                  <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                    onClick={() => { setEditingId(null); setFormData(emptyForm); }}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </Reveal>

        {/* List Produk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading && products.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ height: '100px' }} />
            ))
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>store_mall_directory</span>
              Belum ada produk. Tambahkan produk pertama untuk Pasar TARA.
            </div>
          ) : (
            products.map(p => (
              <Reveal key={p.id} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', opacity: p.isActive ? 1 : 0.5, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="material-icons-round" style={{ fontSize: '28px', color: 'var(--cyber-pink)' }}>{p.icon}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--cyber-pink)', letterSpacing: '0.08em', background: 'rgba(216,150,167,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {p.category}
                    </span>
                    {!p.isActive && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        NONAKTIF
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{p.title}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--outline)' }}>
                    <span>{formatIDR(p.price)}</span>
                    <span>•</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleToggleActive(p)} title={p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: p.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', color: p.isActive ? '#10b981' : 'var(--outline)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>{p.isActive ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  <button onClick={() => handleEdit(p)} title="Edit"
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button onClick={() => handleDelete(p.id)} title="Hapus"
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.05)', color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>delete_outline</span>
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
