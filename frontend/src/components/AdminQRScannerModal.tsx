import React, { useState, useEffect, useRef } from 'react'; 
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { getApiBaseUrl } from '../utils/api';
import { ADMIN_ROLES } from '../utils/constants';

interface AdminQRScannerModalProps {
  onSuccess: (data: any, token: string) => void;
}

export const AdminQRScannerModal: React.FC<AdminQRScannerModalProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [, setCameraReady] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const scanLock = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SCANNER_ID = "admin-qr-reader";

  useEffect(() => {
    isMounted.current = true;

    const setupScanner = async () => {
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
      (async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            isInitialized.current = false;
            await scannerRef.current.stop();
            scannerRef.current.clear();
          } catch (err) {}
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

      isInitialized.current = true;
      await scannerRef.current.start(
        { facingMode: "environment" }, 
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.85);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!scanLock.current) {
            setScanSuccess(true);
            if (navigator.vibrate) navigator.vibrate(100);
            handleScan(decodedText);
          }
        },
        () => {} 
      );

      if (isMounted.current) setCameraReady(true);
      
      const videoTrack = (scannerRef.current as any)?._videoElement?.srcObject?.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch) setHasTorch(true);
      }
    } catch (err: any) {
      isInitialized.current = false;
      if (isMounted.current) setError(err.message || "Gagal mengakses kamera.");
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    const newState = !torchEnabled;
    try {
      await scannerRef.current.applyVideoConstraints({ torch: newState } as any);
      setTorchEnabled(newState);
    } catch (err) {}
  };

  const handleScan = async (text: string) => {
    if (scanLock.current) return;
    scanLock.current = true;
    
    if (isMounted.current) {
      setStatus("Verifikasi Akses Admin...");
      setError(null);
    }

    try {
      let qrData;
      try {
        qrData = JSON.parse(text.trim());
      } catch (e) {
        throw new Error("Format QR tidak valid.");
      }
      
      if (!qrData.ucid || !qrData.token) {
        throw new Error("Data identitas tidak lengkap.");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const API_BASE = getApiBaseUrl();
      const deviceId = `${navigator.platform}-${window.screen.width}`;

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

      // Validasi Role Admin
      if (!ADMIN_ROLES.includes(data.user.role)) {
        throw new Error(`Akses Ditolak. Role ${data.user.role} tidak memiliki hak akses ke sistem ini.`);
      }

      // Simpan Session di sessionStorage (No Cache)
      sessionStorage.setItem('tara_admin_token', data.token);
      sessionStorage.setItem('tara_admin_user', JSON.stringify(data.user));
      
      setStatus("Akses Administrator Diberikan!");
      setTimeout(() => {
        if (isMounted.current) {
          onSuccess(data.user, data.token);
        }
      }, 800);

    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Terjadi kesalahan.");
        setScanSuccess(false);
        setStatus(null);
        setTimeout(() => {
          if (isMounted.current) scanLock.current = false;
        }, 2500);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    if (isMounted.current) setStatus("Menganalisis File...");

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
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto'
    }}>
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)', zIndex: 2, pointerEvents: 'none' }}></div>
        
        {/* Frame Brackets */}
        <div style={{ position: 'absolute', inset: '20px', zIndex: 3, pointerEvents: 'none' }}>
           {[
             { t: 0, l: 0, bt: '4px solid #3b82f6', bl: '4px solid #3b82f6', rd: '20px 0 0 0' },
             { t: 0, r: 0, bt: '4px solid #3b82f6', br: '4px solid #3b82f6', rd: '0 20px 0 0' },
             { b: 0, l: 0, bb: '4px solid #3b82f6', bl: '4px solid #3b82f6', rd: '0 0 0 20px' },
             { b: 0, r: 0, bb: '4px solid #3b82f6', br: '4px solid #3b82f6', rd: '0 0 20px 0' }
           ].map((s, i) => (
             <div key={i} style={{
               position: 'absolute', width: '32px', height: '32px',
               top: s.t, left: s.l, right: s.r, bottom: s.b,
               borderTop: s.bt, borderLeft: s.bl, borderRight: s.br, borderBottom: s.bb,
               borderRadius: s.rd,
               borderColor: scanSuccess ? '#10b981' : '#3b82f6',
               transition: 'all 0.3s ease',
               boxShadow: scanSuccess ? '0 0 15px #10b981' : '0 0 10px rgba(59, 130, 246, 0.4)'
             }} />
           ))}
        </div>

        {hasTorch && !scanSuccess && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleTorch(); }}
            style={{
              position: 'absolute', bottom: '16px', right: '16px',
              background: torchEnabled ? '#3b82f6' : 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
            }}
          >
            <span className="material-icons-round" style={{ fontSize: '20px' }}>{torchEnabled ? 'flashlight_off' : 'flashlight_on'}</span>
          </button>
        )}
      </div>

      <div style={{ marginTop: '24px', width: '100%' }}>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="btn btn-glass"
          style={{ width: '100%', height: '48px', borderRadius: '12px' }}
        >
          <span className="material-icons-round">photo_library</span> UNGGAH QR
        </button>
      </div>

      {(status || error) && (
        <div style={{ marginTop: '16px', width: '100%', textAlign: 'center' }}>
          {status && <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem' }}>{status}</div>}
          {error && <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}
        </div>
      )}
      <style>{`
        #${SCANNER_ID} > div { display: none !important; }
        #${SCANNER_ID} video { display: block !important; width: 100% !important; height: 100% !important; object-fit: cover !important; }
      `}</style>
    </div>
  );
};
