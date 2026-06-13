import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { useCounter } from '../hooks/useCounter';
import { getApiBaseUrl } from '../utils/api';

const CounterStat = ({ target, label }: { target: number, label: string }) => {
  const { count, elementRef } = useCounter(target);
  return (
    <div className="hero-stat" ref={elementRef}>
      <span className="hero-stat-number">{count.toLocaleString()}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
};

export const Home: React.FC = () => {
  const [stats, setStats] = useState({ totalWarga: 0, eventMendatang: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/stats`);
        const data = await res.json();
        setStats({
          totalWarga: data.totalWarga,
          eventMendatang: data.eventMendatang
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="container hero-content">
          <Reveal>
            <div className="hero-badge">
              <span className="material-icons-round">auto_awesome</span>
              <span>Platform Digital Karang Taruna</span>
            </div>
            <h1 className="hero-title">
              TARA: <span className="text-gradient">Inovasi Digital</span><br />untuk Lingkungan
            </h1>
            <p className="hero-subtitle">
              Satu QR untuk semua urusan warga. Memberdayakan Karang Taruna dengan alat manajemen komunitas generasi berikutnya.
            </p>
            <div className="hero-actions">
              <Link to="/kegiatan" className="btn btn-primary">
                <span className="material-icons-round">qr_code_scanner</span>
                Scan Pendaftaran
              </Link>
              <Link to="/dasbor" className="btn btn-glass">
                <span className="material-icons-round">dashboard</span>
                Buka Dasbor
              </Link>
            </div>
            <div className="hero-stats">
              <CounterStat target={stats.totalWarga} label="WARGA AKTIF" />
              <div className="hero-stat-divider"></div>
              <CounterStat target={stats.eventMendatang} label="KEGIATAN" />
              <div className="hero-stat-divider"></div>
              <CounterStat target={35} label="UMKM MITRA" />
            </div>
          </Reveal>
        </div>

      </section>

      {/* QR Section */}
      <section className="section" id="qr-section">
        <div className="container">
          <Reveal className="section-header">
            <span className="section-badge">SISTEM IDENTIFIKASI DINAMIS</span>
            <h2 className="section-title">Akses Cepat via <span className="text-gradient">QR Code</span></h2>
            <p className="section-desc">Pendaftaran kegiatan, verifikasi kehadiran, dan akses layanan warga — semua dalam satu scan.</p>
          </Reveal>
          <div className="qr-grid">
            <Reveal className="glass-card qr-card">
              <div className="qr-card-icon accent-pink">
                <span className="material-icons-round">qr_code_2</span>
              </div>
              <h3>QR Event Otomatis</h3>
              <p>Setiap event baru menghasilkan QR Code unik secara otomatis. Tempel di poster fisik, scan langsung daftar.</p>
            </Reveal>
            <Reveal className="glass-card qr-card">
              <div className="qr-card-icon accent-blue">
                <span className="material-icons-round">badge</span>
              </div>
              <h3>Kartu Digital Peserta</h3>
              <p>Peserta terdaftar mendapat kartu digital berisi QR unik untuk verifikasi kehadiran instan di lapangan.</p>
            </Reveal>
            <Reveal className="glass-card qr-card">
              <div className="qr-card-icon accent-green">
                <span className="material-icons-round">phone_android</span>
              </div>
              <h3>Mobile Scanner</h3>
              <p>Panitia cukup scan QR via HP untuk check-in peserta. Proses verifikasi di bawah 5 detik per orang.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt" id="features">
        <div className="container">
          <Reveal className="section-header">
            <span className="section-badge">TARA HUB</span>
            <h2 className="section-title">Layanan <span className="text-gradient">Komunitas Digital</span></h2>
            <p className="section-desc">Ekosistem lengkap untuk pemberdayaan warga — dari pelaporan masalah hingga marketplace UMKM.</p>
          </Reveal>
          <div className="features-grid">
            <Reveal className="feature-card glass-card">
              <div className="feature-icon">
                <span className="material-icons-round">storefront</span>
              </div>
              <div className="feature-content">
                <h3>Pasar TARA (UMKM)</h3>
                <p>Ruang digital bagi warga untuk memajang produk dan jasa. Bebas biaya transaksi untuk anggota Karang Taruna.</p>
                <Link to="/pasar" className="feature-link">
                  Jelajahi Pasar <span className="material-icons-round">arrow_forward</span>
                </Link>
              </div>
            </Reveal>
            <Reveal className="feature-card glass-card">
              <div className="feature-icon">
                <span className="material-icons-round">report_problem</span>
              </div>
              <div className="feature-content">
                <h3>Lapor Warga</h3>
                <p>Form pelaporan masalah lingkungan dengan status pelacakan real-time. Identitas pelapor dilindungi enkripsi.</p>
                <Link to="/lapor" className="feature-link">
                  Buat Laporan <span className="material-icons-round">arrow_forward</span>
                </Link>
              </div>
            </Reveal>
            <Reveal className="feature-card glass-card">
              <div className="feature-icon">
                <span className="material-icons-round">inventory_2</span>
              </div>
              <div className="feature-content">
                <h3>Inventaris Digital</h3>
                <p>Sistem peminjaman aset RT/RW dengan jadwal transparan dan booking online.</p>
                <a href="#" className="feature-link">
                  Lihat Inventaris <span className="material-icons-round">arrow_forward</span>
                </a>
              </div>
            </Reveal>
            <Reveal className="feature-card glass-card">
              <div className="feature-icon">
                <span className="material-icons-round">analytics</span>
              </div>
              <div className="feature-content">
                <h3>Dashboard Analitik</h3>
                <p>Analitik real-time untuk organisasi lokal. Lacak partisipasi, alokasi sumber daya, dan dampak proyek.</p>
                <Link to="/dasbor" className="feature-link">
                  Buka Dashboard <span className="material-icons-round">arrow_forward</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section" id="cta">
        <div className="cta-bg-effects">
          <div className="cta-orb cta-orb-1"></div>
          <div className="cta-orb cta-orb-2"></div>
        </div>
        <div className="container">
          <Reveal className="cta-content glass-card">
            <h2>Bergabung dengan Komunitas Digital</h2>
            <p>Jadilah bagian dari transformasi digital Karang Taruna. Daftarkan diri Anda dan akses semua layanan TARA.</p>
            <div className="cta-actions">
              <Link to="/kegiatan" className="btn btn-primary">
                <span className="material-icons-round">person_add</span>
                Daftar Sekarang
              </Link>
              <Link to="/dasbor" className="btn btn-glass">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
