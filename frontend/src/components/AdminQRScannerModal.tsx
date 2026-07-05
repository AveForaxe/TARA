import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { getApiBaseUrl } from '../utils/api';
import { ADMIN_ROLES } from '../utils/constants';

interface AdminQRScannerModalProps {
  onSuccess: (data: any, token: string) => void;
}

type CameraState = 'loading' | 'active' | 'error';

export const AdminQRScannerModal: React.FC<AdminQRScannerModalProps> = ({ onSuccess }) => {
  const [error, setError]               = useState<string | null>(null);
  const [status, setStatus]             = useState<string | null>(null);
  const [scanSuccess, setScanSuccess]   = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch]         = useState(false);
  const [cameraState, setCameraState]   = useState<CameraState>('loading');

  const scannerRef     = useRef<Html5Qrcode | null>(null);
  const isInitialized  = useRef(false);
  const isMounted      = useRef(true);
  const scanLock       = useRef(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const SCANNER_ID = "admin-qr-reader";

  useEffect(() => {
    isMounted.current = true;

    const setup = async () => {
      await new Promise(r => setTimeout(r, 150));
      if (!isMounted.current || isInitialized.current) return;
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(SCANNER_ID, {
            verbose: false,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          });
        }
        await initializeScanner();
      } catch {
        if (isMounted.current) setCameraState('error');
      }
    };

    setup();

    return () => {
      isMounted.current = false;
      (async () => {
        if (scannerRef.current?.isScanning) {
          try { isInitialized.current = false; await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
        }
      })();
    };
  }, []);

  const initializeScanner = async () => {
    if (!scannerRef.current || isInitialized.current) return;
    try {
      if (isMounted.current) { setError(null); setCameraState('loading'); }
      isInitialized.current = true;

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (w, h) => {
            const size = Math.floor(Math.min(w, h) * 0.7);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        (decoded) => {
          if (!scanLock.current) {
            setScanSuccess(true);
            if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
            handleScan(decoded);
          }
        },
        () => {}
      );

      if (isMounted.current) setCameraState('active');
      const track = (scannerRef.current as any)?._videoElement?.srcObject?.getVideoTracks()[0];
      if (track?.getCapabilities?.()?.torch) setHasTorch(true);

    } catch {
      isInitialized.current = false;
      if (isMounted.current) setCameraState('error');
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    const next = !torchEnabled;
    try { await scannerRef.current.applyVideoConstraints({ torch: next } as any); setTorchEnabled(next); } catch {}
  };

  const handleScan = async (text: string) => {
    if (scanLock.current) return;
    scanLock.current = true;
    if (isMounted.current) { setStatus('Memverifikasi identitas...'); setError(null); }

    try {
      let qrData: any;
      try { qrData = JSON.parse(text.trim()); } catch { throw new Error('Format QR tidak valid.'); }
      if (!qrData.ucid || !qrData.token) throw new Error('Data identitas tidak lengkap.');

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${getApiBaseUrl()}/api/auth/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ucid: qrData.ucid, token: qrData.token, deviceId: `${navigator.platform}-${window.screen.width}` }),
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Akses ditolak.');
      if (!ADMIN_ROLES.includes(data.user.role)) throw new Error(`Role "${data.user.role}" tidak memiliki akses admin.`);

      sessionStorage.setItem('tara_admin_token', data.token);
      sessionStorage.setItem('tara_admin_user', JSON.stringify(data.user));

      if (isMounted.current) setStatus(`Selamat datang, ${data.user.nama}!`);
      setTimeout(() => { if (isMounted.current) onSuccess(data.user, data.token); }, 900);

    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Terjadi kesalahan.');
        setScanSuccess(false);
        setStatus(null);
        setTimeout(() => { if (isMounted.current) scanLock.current = false; }, 2500);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (isMounted.current) { setStatus('Membaca QR dari gambar...'); setError(null); setScanSuccess(false); }

    const FILE_ID = 'qr-file-hidden';
    let el = document.getElementById(FILE_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = FILE_ID;
      el.style.cssText = 'position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(el);
    }

    try {
      if (scannerRef.current?.isScanning) { isInitialized.current = false; await scannerRef.current.stop(); }
      const fs = new Html5Qrcode(FILE_ID, { verbose: false, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
      const decoded = await fs.scanFile(file, false);
      handleScan(decoded);
    } catch {
      if (isMounted.current) { setError('QR tidak terbaca. Coba screenshot yang lebih jelas dan pastikan ada QR Code-nya.'); setStatus(null); }
      initializeScanner();
    }
  };

  const accent = scanSuccess ? '#10b981' : '#3b82f6';

  return (
    <>
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

      <div className="qrs-root">

        {/* ── Left / Top: Camera viewport ── */}
        <div className="qrs-viewport">
          <div id={SCANNER_ID} className="qrs-video-container" />

          {/* Vignette */}
          <div className="qrs-vignette" />

          {/* Loading */}
          {cameraState === 'loading' && (
            <div className="qrs-overlay">
              <div className="qrs-spinner" />
              <span className="qrs-overlay-text">Mengaktifkan kamera...</span>
            </div>
          )}

          {/* No camera */}
          {cameraState === 'error' && (
            <div className="qrs-overlay">
              <span className="material-icons-round qrs-no-cam-icon">no_photography</span>
              <span className="qrs-overlay-text">Kamera tidak tersedia</span>
              <span className="qrs-overlay-sub">Gunakan tombol unggah di bawah</span>
            </div>
          )}

          {/* Success overlay */}
          {scanSuccess && (
            <div className="qrs-success-overlay">
              <div className="qrs-success-circle">
                <span className="material-icons-round">check</span>
              </div>
            </div>
          )}

          {/* Frame + scanline — only when camera active */}
          {cameraState === 'active' && !scanSuccess && (
            <div className="qrs-frame-wrap">
              <div className="qrs-frame" style={{ '--acc': accent } as any}>
                <div className="qrs-corner qrs-tl" />
                <div className="qrs-corner qrs-tr" />
                <div className="qrs-corner qrs-bl" />
                <div className="qrs-corner qrs-br" />
                <div className="qrs-scanline" style={{ background: `linear-gradient(transparent, ${accent}bb, transparent)` }} />
              </div>
            </div>
          )}

          {/* Torch */}
          {hasTorch && cameraState === 'active' && !scanSuccess && (
            <button className="qrs-torch" style={{ background: torchEnabled ? '#3b82f6' : 'rgba(0,0,0,0.55)' }}
              onClick={e => { e.stopPropagation(); toggleTorch(); }}>
              <span className="material-icons-round">{torchEnabled ? 'flashlight_off' : 'flashlight_on'}</span>
            </button>
          )}

          {/* Status pill inside camera */}
          {status && cameraState === 'active' && (
            <div className="qrs-pill" style={{ color: scanSuccess ? '#34d399' : '#93c5fd' }}>
              <span className="qrs-pill-dot" style={{ background: scanSuccess ? '#10b981' : '#3b82f6' }} />
              {status}
            </div>
          )}
        </div>

        {/* ── Right / Bottom: Controls panel ── */}
        <div className="qrs-panel">
          <div className="qrs-panel-header">
            <span className="material-icons-round" style={{ color: '#3b82f6', fontSize: '22px' }}>qr_code_scanner</span>
            <div>
              <div className="qrs-panel-title">Scan QR Identity</div>
              <div className="qrs-panel-sub">
                {cameraState === 'active' ? 'Arahkan kamera ke QR Code' : 'Unggah gambar QR Code'}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="qrs-steps">
            <div className="qrs-step">
              <div className="qrs-step-num" style={{ background: cameraState === 'active' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)', color: cameraState === 'active' ? '#93c5fd' : '#4b5563' }}>1</div>
              <span>Arahkan kamera ke QR Code identitas TARA</span>
            </div>
            <div className="qrs-step-divider" />
            <div className="qrs-step">
              <div className="qrs-step-num" style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>2</div>
              <span>Atau unggah screenshot / foto yang berisi QR</span>
            </div>
          </div>

          {/* Status (when camera not active) */}
          {status && cameraState !== 'active' && (
            <div className="qrs-status-panel">
              <div className="qrs-pill-dot" style={{ background: '#3b82f6', animation: 'qrsPulse 1s ease infinite' }} />
              <span style={{ color: '#93c5fd', fontSize: '0.83rem', fontWeight: 600 }}>{status}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="qrs-error">
              <span className="material-icons-round" style={{ fontSize: '17px', flexShrink: 0 }}>error_outline</span>
              {error}
            </div>
          )}

          {/* Upload button */}
          <button className="qrs-upload" onClick={() => fileInputRef.current?.click()}>
            <span className="material-icons-round">upload_file</span>
            Unggah Gambar QR
          </button>

          {/* Retry camera */}
          {cameraState === 'error' && (
            <button className="qrs-retry" onClick={() => { isInitialized.current = false; initializeScanner(); }}>
              <span className="material-icons-round">refresh</span>
              Coba aktifkan kamera
            </button>
          )}

          <p className="qrs-footer-note">
            QR bisa berupa screenshot poster, kartu, atau layar — tidak perlu QR murni.
          </p>
        </div>
      </div>

      <style>{`
        /* ── Root layout ── */
        .qrs-root {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 400px;
          gap: 20px;
          margin: 0 auto;
        }

        /* ── Viewport ── */
        .qrs-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #0a0a0c;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .qrs-video-container { width: 100%; height: 100%; }
        #${SCANNER_ID} > div { display: none !important; }
        #${SCANNER_ID} video {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        /* Vignette */
        .qrs-vignette {
          position: absolute; inset: 0; pointer-events: none; z-index: 2;
          background: radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.68) 100%);
        }

        /* Overlay (loading / error) */
        .qrs-overlay {
          position: absolute; inset: 0; z-index: 6;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
        }
        .qrs-spinner {
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.07);
          border-top-color: #3b82f6;
          animation: qrsSpin 0.85s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes qrsSpin { to { transform: rotate(360deg); } }
        .qrs-overlay-text { color: #9ca3af; font-size: 0.82rem; font-weight: 500; }
        .qrs-overlay-sub  { color: #4b5563; font-size: 0.72rem; margin-top: 2px; }
        .qrs-no-cam-icon  { font-size: 44px; color: #374151; margin-bottom: 8px; }

        /* Success overlay */
        .qrs-success-overlay {
          position: absolute; inset: 0; z-index: 8;
          display: flex; align-items: center; justify-content: center;
          background: rgba(16,185,129,0.1);
          animation: qrsFadeIn 0.2s ease;
        }
        .qrs-success-circle {
          width: 76px; height: 76px; border-radius: 50%;
          background: #10b981;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 48px rgba(16,185,129,0.45);
          animation: qrsPopIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .qrs-success-circle .material-icons-round { color: #fff; font-size: 38px; }
        @keyframes qrsPopIn  { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes qrsFadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Frame & corners */
        .qrs-frame-wrap {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          display: flex; align-items: center; justify-content: center;
        }
        .qrs-frame {
          position: relative;
          width: 62%; height: 62%;
          /* no overflow:hidden — lets glow render fully */
        }
        .qrs-corner {
          position: absolute;
          width: 26px; height: 26px;
          border-color: var(--acc);
          border-style: solid;
          filter: drop-shadow(0 0 5px var(--acc));
          transition: border-color 0.3s;
        }
        .qrs-tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
        .qrs-tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
        .qrs-bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
        .qrs-br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }
        .qrs-scanline {
          position: absolute; left: 0; right: 0; height: 3px;
          animation: qrsScan 2.2s ease-in-out infinite;
        }
        @keyframes qrsScan {
          0%   { top: 0;  opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: calc(100% - 3px); opacity: 0; }
        }

        /* Torch */
        .qrs-torch {
          position: absolute; bottom: 14px; right: 14px; z-index: 7;
          width: 42px; height: 42px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .qrs-torch .material-icons-round { font-size: 20px; }

        /* Status pill (inside camera) */
        .qrs-pill {
          position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
          z-index: 7; display: flex; align-items: center; gap: 7px;
          background: rgba(0,0,0,0.62); backdrop-filter: blur(12px);
          padding: 7px 16px; border-radius: 100px;
          font-size: 0.77rem; font-weight: 600; white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .qrs-pill-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
          animation: qrsPulse 1.1s ease-in-out infinite;
        }
        @keyframes qrsPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

        /* ── Right / Bottom panel ── */
        .qrs-panel {
          display: flex; flex-direction: column; gap: 12px;
        }
        .qrs-panel-header {
          display: flex; align-items: center; gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .qrs-panel-title { color: #f3f4f6; font-weight: 700; font-size: 1rem; }
        .qrs-panel-sub   { color: #6b7280; font-size: 0.78rem; margin-top: 2px; }

        /* Steps */
        .qrs-steps { display: flex; flex-direction: column; gap: 0; }
        .qrs-step {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.8rem; color: #6b7280; line-height: 1.5;
          padding: 6px 0;
        }
        .qrs-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
          transition: all 0.3s;
        }
        .qrs-step-divider {
          width: 1px; height: 12px; margin-left: 12px;
          background: rgba(255,255,255,0.06);
        }

        /* Status panel (below camera) */
        .qrs-status-panel {
          display: flex; align-items: center; gap: 8px;
          background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.15);
          border-radius: 10px; padding: 10px 14px;
          animation: qrsFadeIn 0.2s ease;
        }

        /* Error */
        .qrs-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18);
          border-radius: 12px; padding: 11px 14px;
          color: #f87171; font-size: 0.8rem; font-weight: 500; line-height: 1.5;
          animation: qrsFadeIn 0.2s ease;
        }

        /* Upload button */
        .qrs-upload {
          width: 100%; height: 52px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.28);
          border-radius: 14px; border-style: dashed;
          color: #93c5fd; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; gap: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .qrs-upload:hover {
          background: rgba(59,130,246,0.17);
          border-color: rgba(59,130,246,0.5);
          border-style: solid;
          color: #bfdbfe;
        }
        .qrs-upload:active { transform: scale(0.98); }

        /* Retry */
        .qrs-retry {
          width: 100%; height: 38px;
          background: transparent; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; color: #4b5563; font-size: 0.78rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s;
        }
        .qrs-retry:hover { background: rgba(255,255,255,0.03); color: #6b7280; }
        .qrs-retry .material-icons-round { font-size: 16px; }

        /* Footer note */
        .qrs-footer-note {
          font-size: 0.72rem; color: #374151;
          text-align: center; line-height: 1.5;
          margin-top: 2px;
        }

        /* ── Desktop: side by side ── */
        @media (min-width: 640px) {
          .qrs-root {
            flex-direction: row;
            align-items: flex-start;
            max-width: 660px;
            gap: 32px;
          }
          .qrs-viewport {
            width: 280px;
          }
          .qrs-panel {
            flex: 1;
            padding-top: 4px;
          }
          .qrs-footer-note { text-align: left; }
        }

        /* ── Mobile ── */
        @media (max-width: 639px) {
          .qrs-viewport { border-radius: 18px; }
          .qrs-upload { height: 56px; font-size: 0.95rem; }
          .qrs-panel-header { display: none; } /* header already in parent */
        }
      `}</style>
    </>
  );
};
