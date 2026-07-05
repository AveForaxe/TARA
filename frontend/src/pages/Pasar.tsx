import React, { useState, useEffect } from 'react';
import { Reveal } from '../components/Reveal';
import { useNotification } from '../context/NotificationContext';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  icon: string;
}

const CATEGORY_COLORS: Record<string, { bg: string[]; text: string }> = {
  FASHION:    { bg: ['#1a1c2e', '#2a1a2e'], text: 'var(--tertiary)' },
  DIGITAL:    { bg: ['#2a1a1e', '#1a2a2e'], text: 'var(--cyber-pink)' },
  JASA:       { bg: ['#1a1e2a', '#2a2a1e'], text: '#64dc96' },
  KERAJINAN:  { bg: ['#2a1e1a', '#1a1e2a'], text: 'var(--primary)' },
  MAKANAN:    { bg: ['#1a2a1e', '#1a1c2e'], text: '#fbbf24' },
};

const formatIDR = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

export const Pasar: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      console.error('Gagal mengambil produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = activeCategory === 'Semua'
    ? products
    : products.filter(p => p.category.toUpperCase() === activeCategory.toUpperCase());

  const handleOrder = (product: Product) => {
    showNotification('info', 'Fitur Segera Hadir', `Pemesanan untuk "${product.title}" akan segera tersedia.`);
  };

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="container">
          <Reveal>
            <span className="section-badge">PASAR TARA</span>
            <h1>Memberdayakan Inovasi <span className="text-gradient">Pemuda Lokal</span></h1>
            <p>Dukung kreator generasi penerus. Produk unggulan dari pengusaha Karang Taruna, didigitalisasi untuk masa depan.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Category Filter */}
          <div className="swipe-scroll" style={{ display: 'flex', gap: '12px', marginBottom: '40px', paddingBottom: '8px' }}>
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-glass'}`}
                style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid-3" style={{ gap: '20px' }}>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="glass-card skeleton-card" style={{ height: '300px' }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="glass-card" style={{ padding: '64px', textAlign: 'center', gridColumn: '1 / -1', opacity: 0.6 }}>
                <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>store_mall_directory</span>
                <p>Belum ada produk dalam kategori ini.</p>
              </div>
            ) : (
              filtered.map((p) => {
                const colorSet = CATEGORY_COLORS[p.category.toUpperCase()] || { bg: ['#1a1c2e', '#1a2a2e'], text: 'var(--primary)' };
                return (
                  <Reveal key={p.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: '200px', background: `linear-gradient(135deg, ${colorSet.bg[0]}, ${colorSet.bg[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons-round" style={{ fontSize: '64px', color: colorSet.text, opacity: 0.6 }}>{p.icon}</span>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: colorSet.text, letterSpacing: '0.1em' }}>{p.category.toUpperCase()}</span>
                      <h3 style={{ color: '#fff', margin: '6px 0' }}>{p.title}</h3>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginBottom: '12px' }}>{p.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{formatIDR(p.price)}</span>
                        <button className="btn btn-primary btn-sm" onClick={() => handleOrder(p)}>Pesan</button>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            )}
          </div>

          {/* CTA */}
          <Reveal className="glass-card" style={{ textAlign: 'center', marginTop: '48px', padding: '48px 32px' }}>
            <h2 style={{ color: '#fff', marginBottom: '12px' }}>Bergabung dengan Ekonomi Pemuda</h2>
            <p style={{ color: 'var(--on-surface-variant)', maxWidth: '500px', margin: '0 auto 24px' }}>
              Dapatkan notifikasi tentang rilis eksklusif, acara komunitas, dan mitra UMKM baru dari jaringan TARA.
            </p>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <input type="email" className="form-input" placeholder="Email Anda" style={{ flex: 1 }} />
              <button className="btn btn-primary">Berlangganan</button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
