import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';

export const NotFound: React.FC = () => {
  return (
    <div className="page-enter" style={{ 
      height: '100vh', 
      display: 'grid', 
      placeItems: 'center',
      background: 'radial-gradient(circle at center, #1a1b1f 0%, #070b14 100%)'
    }}>
      <Reveal className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ 
          fontSize: '6rem', 
          fontWeight: 900, 
          lineHeight: 1, 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--color-pink), var(--color-blue))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          404
        </div>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>Halaman Tidak Ditemukan</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', lineHeight: 1.6 }}>
          Sepertinya rute yang Anda tuju salah atau telah dipindahkan. Pastikan penulisan URL sudah benar.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <span className="material-icons-round">home</span> Kembali ke Beranda
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-glass"
          >
            <span className="material-icons-round">arrow_back</span> Kembali
          </button>
        </div>
      </Reveal>
    </div>
  );
};
