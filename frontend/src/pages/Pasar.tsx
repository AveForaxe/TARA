import React from 'react';
import { Reveal } from '../components/Reveal';

export const Pasar: React.FC = () => {
  const products = [
    { category: 'FASHION', title: 'Neo-Batik Digital Prints', price: 'Rp 150.000', icon: 'palette', colors: ['#1a1c2e', '#2a1a2e'], colorText: 'var(--tertiary)' },
    { category: 'FASHION', title: 'Cyber-Series Merch', price: 'Rp 250.000', icon: 'checkroom', colors: ['#1a2a1e', '#1a1c2e'], colorText: 'var(--primary)' },
    { category: 'DIGITAL', title: 'UI Asset Kits', price: 'Rp 75.000', icon: 'code', colors: ['#2a1a1e', '#1a2a2e'], colorText: 'var(--cyber-pink)' },
    { category: 'JASA', title: 'Digital Mentoring', price: 'Rp 100.000', icon: 'school', colors: ['#1a1e2a', '#2a2a1e'], colorText: '#64dc96' },
    { category: 'KERAJINAN', title: 'Precision Timer V1', price: 'Rp 350.000', icon: 'timer', colors: ['#2a1e1a', '#1a1e2a'], colorText: 'var(--tertiary)' },
    { category: 'KERAJINAN', title: 'Sonic Bloom Pods', price: 'Rp 275.000', icon: 'headphones', colors: ['#1e1a2a', '#2a1e1a'], colorText: 'var(--primary)' }
  ];

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
          {/* Category Chips - Swipeable on Mobile */}
          <div className="swipe-scroll" style={{ display: 'flex', gap: '12px', marginBottom: '40px', paddingBottom: '8px', justifyContent: 'flex-start' }}>
            {['Semua', 'Makanan', 'Fashion', 'Digital', 'Kerajinan', 'Jasa'].map((cat, i) => (
              <button key={i} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-glass'}`} style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}>{cat}</button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid-3" style={{ gap: '20px' }}>
            {products.map((p, i) => (
              <Reveal key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '200px', background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '64px', color: p.colorText, opacity: 0.6 }}>{p.icon}</span>
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: p.colorText, letterSpacing: '0.1em' }}>{p.category}</span>
                  <h3 style={{ color: '#fff', margin: '6px 0' }}>{p.title}</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginBottom: '12px' }}>Inovasi karya lokal oleh Karang Taruna.</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{p.price}</span>
                    <button className="btn btn-primary btn-sm">Pesan</button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal className="glass-card" style={{ textAlign: 'center', marginTop: '48px', padding: '48px 32px' }}>
            <h2 style={{ color: '#fff', marginBottom: '12px' }}>Bergabung dengan Ekonomi Pemuda</h2>
            <p style={{ color: 'var(--on-surface-variant)', maxWidth: '500px', margin: '0 auto 24px' }}>Dapatkan notifikasi tentang rilis eksklusif, acara komunitas, dan mitra UMKM baru dari jaringan TARA.</p>
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
