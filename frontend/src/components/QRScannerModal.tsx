import React, { useState, useEffect, useRef } from 'react'; 
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { getApiBaseUrl } from '../utils/api';

interface QRScannerModalProps {
  onSuccess: (data: any) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitialized = useRef(false); // Guard untuk mencegah double-start
  const isMounted = useRef(true);      // Guard untuk mencegah state update pada unmounted component
  const scanLock = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SCANNER_ID = "tara-qr-reader-engine";

  // 1. LIFECYCLE MANAGEMENT (React 18 Safe)
  useEffect(() => {
    isMounted.current = true;

    const setupScanner = async () => {
      // Tunggu sejenak untuk memastikan DOM benar-benar siap (terutama di StrictMode)
      await new Promise(r => setTimeout(r, 100));
      if (!isMounted.current || isInitialized.current) return;

      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(SCANNER_ID, {
            verbose: false,
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
          });
        }
        
        await initializeScanner();
      } catch (err) {
        console.error("Scanner setup failed:", err);
      }
    };

    setupScanner();

    return () => {
      isMounted.current = false;
      // Gunakan IIFE untuk async cleanup
      (async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            isInitialized.current = false;
            await scannerRef.current.stop();
            // Penting: clear() menghapus elemen video yang tersisa di DOM
            scannerRef.current.clear();
            console.log("🔒 Scanner lifecycle: CLEANUP SUCCESS");
          } catch (err) {
            console.warn("Scanner cleanup warning:", err);
          }
        }
      })();
    };
  }, []);

  const initializeScanner = async () => {
    if (!scannerRef.current || isInitialized.current) return;

    try {
      if (isMounted.current) {
        setError(null);
        setCameraReady(false);
      }

      // Menggunakan { facingMode: "environment" } untuk mengutamakan kamera belakang pada mobile
      isInitialized.current = true;
      await scannerRef.current.start(
        { facingMode: "environment" }, 
        {
          fps: 24,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.85);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            aspectRatio: 1.0, // Consistent with global setting
            facingMode: "environment"
          }
        },
        (decodedText) => {
          if (!scanLock.current) {
            setScanSuccess(true);
            if (navigator.vibrate) navigator.vibrate(100); // Haptic feedback
            handleScan(decodedText);
          }
        },
        () => {} 
      );

      if (isMounted.current) setCameraReady(true);
      
      // Check for torch support
      const videoTrack = (scannerRef.current as any)?._videoElement?.srcObject?.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }
      
      console.log("✅ Scanner lifecycle: INITIALIZED (Environment Camera)");

    } catch (err: any) {
      isInitialized.current = false;
      console.error("❌ Initialization Error:", err);
      if (isMounted.current) {
        setError(err.message || "Gagal mengakses kamera.");
      }
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    const newState = !torchEnabled;
    try {
      await scannerRef.current.applyVideoConstraints({
        torch: newState
      } as any);
      setTorchEnabled(newState);
    } catch (err) {
      console.error("Gagal mengubah status senter:", err);
    }
  };

  const handleScan = async (text: string) => {
    if (scanLock.current) return;
    scanLock.current = true;
    
    console.log("🔍 QR Detected:", text);
    if (isMounted.current) {
      setStatus("Menganalisis QR...");
      setError(null);
    }

    try {
      // 1. Robust Parsing
      let qrData;
      try {
        qrData = JSON.parse(text.trim());
      } catch (e) {
        console.warn("⚠️ QR Parsing Failed:", (e as any).message);
        throw new Error("QR Code bukan format TARA yang valid.");
      }
      
      if (!qrData.ucid || !qrData.token) {
        throw new Error("Data identitas tidak lengkap.");
      }

      // 2. Fast API Handshake dengan Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const API_BASE = getApiBaseUrl();

      const deviceId = `${navigator.platform}-${window.screen.width}`;

      if (isMounted.current) setStatus("Memverifikasi...");

      const response = await fetch(`${API_BASE}/api/auth/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ucid: qrData.ucid,
          token: qrData.token,
          deviceId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Akses ditolak oleh server.");
      }

      // 3. Simpan Session
      localStorage.setItem('tara_token', data.token);
      localStorage.setItem('tara_user', JSON.stringify(data.user));
      localStorage.setItem('tara_device_id', deviceId);
      
      // 4. AUTO-DIRECT: Sangat cepat (400ms)
      setStatus("Akses Diterima!");
      setTimeout(() => {
        if (isMounted.current) {
          onSuccess(data.user);
        }
      }, 400);

    } catch (err: any) {
      console.error("🚫 Auth Error:", err.message);
      if (isMounted.current) {
        let userMessage = "Gangguan koneksi server.";
        if (err.name === 'AbortError') userMessage = "Koneksi lambat, coba lagi.";
        if (err.message.includes('Failed to fetch')) userMessage = "Server tidak terjangkau (Cek jaringan/IP).";
        
        setError(err.message === "QR Code bukan format TARA yang valid." ? err.message : userMessage);
        setScanSuccess(false);
        setStatus(null);
        // Lepas kunci setelah 2 detik agar user bisa coba lagi
        setTimeout(() => {
          if (isMounted.current) scanLock.current = false;
        }, 2000);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    if (isMounted.current) setStatus("Menganalisis File...");

    // Atomic Cleanup sebelum scan file
    if (scannerRef.current.isScanning) {
      isInitialized.current = false;
      await scannerRef.current.stop();
    }

    try {
      const decodedText = await scannerRef.current.scanFile(file, false);
      handleScan(decodedText);
    } catch (err) {
      if (isMounted.current) {
        setError("QR tidak ditemukan pada gambar.");
        setStatus(null);
      }
      initializeScanner(); 
    }
  };

  return (
    <div className="qr-scanner-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', flexDirection: 'column',
      background: '#070B14',
      animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      padding: 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom)'
    }}>
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      
      {/* Modal Container */}
      <div className="qr-scanner-modal-container">
        
        {/* Immersive Camera Background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          overflow: 'hidden', background: '#000'
        }}>
          <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }}></div>
          
          {/* Dark Vignette Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)',
            zIndex: 2
          }}></div>
        </div>

        {/* Header HUD */}
        <div style={{
          position: 'relative', zIndex: 20, padding: '24px 20px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(7,11,20,0.8), transparent)'
        }}>
          <div className="qr-live-badge">
            <div style={{ 
              width: '6px', height: '6px', borderRadius: '50%', 
              background: cameraReady ? '#10b981' : '#f87171', 
              boxShadow: cameraReady ? '0 0 10px #10b981' : '0 0 10px #f87171',
              animation: cameraReady ? 'pulse-green 2s infinite' : 'none'
            }}></div>
            <span style={{ 
              fontSize: '0.65rem', color: '#fff', 
              fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase'
            }}>
              {cameraReady ? 'LIVE MONITOR' : 'INITIALIZING...'}
            </span>
          </div>
          
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: '20px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)', cursor: 'pointer'
            }}
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

          {/* Viewfinder Target */}
          <div style={{
            position: 'relative',
            width: 'min(75vw, 280px)',
            aspectRatio: '1/1',
            zIndex: 20
          }}>
            {/* Corner Brackets */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {[
                { t: 0, l: 0, bt: '4px solid #ff4d8d', bl: '4px solid #ff4d8d', rd: '20px 0 0 0' },
                { t: 0, r: 0, bt: '4px solid #ff4d8d', br: '4px solid #ff4d8d', rd: '0 20px 0 0' },
                { b: 0, l: 0, bb: '4px solid #ff4d8d', bl: '4px solid #ff4d8d', rd: '0 0 0 20px' },
                { b: 0, r: 0, bb: '4px solid #ff4d8d', br: '4px solid #ff4d8d', rd: '0 0 20px 0' }
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', width: '40px', height: '40px',
                  top: s.t, left: s.l, right: s.r, bottom: s.b,
                  borderTop: s.bt, borderLeft: s.bl, borderRight: s.br, borderBottom: s.bb,
                  borderRadius: s.rd,
                  borderColor: scanSuccess ? '#10b981' : '#ff4d8d',
                  transition: 'all 0.3s ease',
                  boxShadow: scanSuccess ? '0 0 20px #10b981' : '0 0 15px rgba(255, 77, 141, 0.4)'
                }} />
              ))}

              {/* Laser Animation */}
              {!scanSuccess && (
                <div style={{
                  position: 'absolute', width: '100%', height: '2px',
                  background: 'linear-gradient(90deg, transparent, #ff4d8d, #fff, #ff4d8d, transparent)',
                  top: '10%', animation: 'scan-loop 2s infinite ease-in-out',
                  boxShadow: '0 0 20px #ff4d8d'
                }}></div>
              )}
            </div>

            {/* Torch Toggle */}
            {hasTorch && !scanSuccess && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleTorch(); }}
                style={{
                  position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)',
                  background: torchEnabled ? 'var(--color-pink)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer', zIndex: 100, backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '24px' }}>
                  {torchEnabled ? 'flashlight_off' : 'flashlight_on'}
                </span>
              </button>
            )}
          </div>

          {/* Action Area & Instructions (Bottom Sheet Style) */}
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(7,11,20,0.95) 60%, transparent)',
            padding: '40px 24px 60px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            zIndex: 30
          }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>Scan QR TARA</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Posisikan QR di dalam bingkai untuk verifikasi.</p>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-primary btn-premium"
              style={{ width: '100%', maxWidth: '320px', height: '54px', borderRadius: '16px', fontSize: '0.9rem' }}
            >
              <span className="material-icons-round">photo_library</span>
              UNGGAH DARI GALERI
            </button>

            {/* Status Feedback */}
            {(status || error) && (
              <div style={{ minHeight: '40px' }}>
                {status && (
                  <div style={{ color: '#ff4d8d', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons-round" style={{ fontSize: '18px', animation: 'spin 2s linear infinite' }}>sync</span>
                    {status}
                  </div>
                )}
                {error && (
                  <div style={{ 
                    background: 'rgba(248, 113, 113, 0.1)', padding: '8px 16px', borderRadius: '10px',
                    color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                    border: '1px solid rgba(248, 113, 113, 0.2)'
                  }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>error_outline</span>
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          /* HIDE LIBRARY DEFAULT MARKERS */
          #${SCANNER_ID} > div { display: none !important; }
          #${SCANNER_ID} video { display: block !important; }

          #${SCANNER_ID} video { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          #${SCANNER_ID} img { display: none !important; }

          .qr-live-badge {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            padding: 6px 12px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            animation: fadeIn 0.5s ease;
            z-index: 30;
          }
          @keyframes scan-loop { 
            0%, 100% { top: 10%; opacity: 0; } 
            15%, 85% { opacity: 1; } 
            50% { top: 90%; } 
          }
          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes fadeIn { 
            from { opacity: 0; transform: scale(1.05); } 
            to { opacity: 1; transform: scale(1); } 
          }
          @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

          /* Desktop Optimization */
          @media (min-width: 769px) {
            .qr-scanner-overlay {
              background: rgba(2, 4, 12, 0.8) !important;
              backdrop-filter: blur(12px) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            /* Container Modal */
            .qr-scanner-modal-container {
              position: relative;
              width: 480px;
              height: 720px;
              max-height: 90vh;
              background: #070B14;
              border-radius: 40px;
              border: 1px solid rgba(255,255,255,0.1);
              box-shadow: 0 40px 100px rgba(0,0,0,0.8);
              display: flex;
              flex-direction: column;
              overflow: hidden;
              z-index: 10;
            }

            .qr-scanner-overlay .qr-hud-top {
              background: rgba(7,11,20,0.9) !important;
            }

            /* Camera constrained to modal */
            .qr-scanner-modal-container > div:first-child {
              position: absolute !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100% !important;
              border-radius: 40px !important;
              z-index: 1 !important;
            }

            .qr-scanner-overlay .btn-premium {
              width: 100% !important;
              max-width: 320px;
              margin: 0 auto;
            }
          }
        ` }} />
      </div>
  );
};
