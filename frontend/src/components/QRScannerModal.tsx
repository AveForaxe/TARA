import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { getApiBaseUrl } from '../utils/api';

interface QRScannerModalProps {
  onSuccess: (data: any) => void;
  onClose: () => void;
}

type CamState = 'loading' | 'active' | 'error';

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onSuccess, onClose }) => {
  const [error, setError]             = useState<string | null>(null);
  const [status, setStatus]           = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch]       = useState(false);
  const [camState, setCamState]       = useState<CamState>('loading');

  const scannerRef    = useRef<Html5Qrcode | null>(null);
  const isInitialized = useRef(false);
  const isMounted     = useRef(true);
  const scanLock      = useRef(false);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  const SCANNER_ID = "tara-qr-reader-engine";

  useEffect(() => {
    isMounted.current = true;
    const setup = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!isMounted.current || isInitialized.current) return;
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(SCANNER_ID, {
            verbose: false,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          });
        }
        await initCam();
      } catch { if (isMounted.current) setCamState('error'); }
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

  const initCam = async () => {
    if (!scannerRef.current || isInitialized.current) return;
    try {
      if (isMounted.current) { setError(null); setCamState('loading'); }
      isInitialized.current = true;

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 20,
          qrbox: (w, h) => {
            const s = Math.floor(Math.min(w, h) * 0.72);
            return { width: s, height: s };
          },
          aspectRatio: 1.0,
        },
        (decoded) => {
          if (!scanLock.current) {
            setScanSuccess(true);
            if (navigator.vibrate) navigator.vibrate([60, 30, 100]);
            handleScan(decoded);
          }
        },
        () => {}
      );

      if (isMounted.current) setCamState('active');
      const track = (scannerRef.current as any)?._videoElement?.srcObject?.getVideoTracks()[0];
      if (track?.getCapabilities?.()?.torch) setHasTorch(true);

    } catch {
      isInitialized.current = false;
      if (isMounted.current) setCamState('error');
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
      try { qrData = JSON.parse(text.trim()); } catch { throw new Error('QR Code bukan format TARA yang valid.'); }
      if (!qrData.ucid || !qrData.token) throw new Error('Data identitas tidak lengkap.');

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const deviceId = `${navigator.platform}-${window.screen.width}`;

      const response = await fetch(`${getApiBaseUrl()}/api/auth/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ucid: qrData.ucid, token: qrData.token, deviceId }),
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Akses ditolak.');

      localStorage.setItem('tara_token', data.token);
      localStorage.setItem('tara_user', JSON.stringify(data.user));
      localStorage.setItem('tara_device_id', deviceId);

      if (isMounted.current) setStatus(`Selamat datang, ${data.user.nama}!`);
      setTimeout(() => { if (isMounted.current) onSuccess(data.user); }, 500);

    } catch (err: any) {
      if (isMounted.current) {
        const msg = err.name === 'AbortError' ? 'Koneksi lambat, coba lagi.' : (err.message || 'Terjadi kesalahan.');
        setError(msg);
        setScanSuccess(false);
        setStatus(null);
        setTimeout(() => { if (isMounted.current) scanLock.current = false; }, 2200);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (isMounted.current) { setStatus('Membaca QR dari gambar...'); setError(null); setScanSuccess(false); }

    const FILE_ID = 'qr-warga-file-hidden';
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
      if (isMounted.current) { setError('QR tidak terbaca. Coba gambar yang lebih jelas.'); setStatus(null); }
      initCam();
    }
  };

  return (
    <div className="wqs-overlay">
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

      <div className="wqs-modal">
        {/* Camera background */}
        <div className="wqs-camera-bg">
          <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }} />
          <div className="wqs-vignette" />
        </div>

        {/* Top HUD */}
        <div className="wqs-top-hud">
          <div className="wqs-live-chip" style={{ borderColor: camState === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)' }}>
            <div className="wqs-live-dot" style={{
              background: camState === 'active' ? '#10b981' : camState === 'loading' ? '#f59e0b' : '#ef4444',
              boxShadow: camState === 'active' ? '0 0 8px #10b981' : 'none',
              animation: camState === 'active' ? 'wqsPulse 2s infinite' : 'none',
            }} />
            <span>{camState === 'active' ? 'KAMERA AKTIF' : camState === 'loading' ? 'MEMUAT...' : 'KAMERA OFF'}</span>
          </div>

          <button className="wqs-close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Center: viewfinder + overlays */}
        <div className="wqs-center">
          {/* Loading */}
          {camState === 'loading' && (
            <div className="wqs-cam-state">
              <div className="wqs-spinner" />
              <span>Mengaktifkan kamera...</span>
            </div>
          )}

          {/* No camera */}
          {camState === 'error' && (
            <div className="wqs-cam-state">
              <span className="material-icons-round wqs-no-cam">no_photography</span>
              <span>Kamera tidak tersedia</span>
              <button className="wqs-retry" onClick={() => { isInitialized.current = false; initCam(); }}>
                <span className="material-icons-round">refresh</span> Coba lagi
              </button>
            </div>
          )}

          {/* Success */}
          {scanSuccess && (
            <div className="wqs-success-overlay">
              <div className="wqs-success-ring">
                <span className="material-icons-round">check</span>
              </div>
            </div>
          )}

          {/* Frame */}
          {camState === 'active' && !scanSuccess && (
            <div className="wqs-frame-wrap">
              <div className="wqs-frame">
                <div className="wqs-c wqs-tl" />
                <div className="wqs-c wqs-tr" />
                <div className="wqs-c wqs-bl" />
                <div className="wqs-c wqs-br" />
                <div className="wqs-laser" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom sheet */}
        <div className="wqs-bottom">
          <div className="wqs-bottom-inner">
            {/* Instruction */}
            <div className="wqs-instruction">
              <p className="wqs-instruction-title">Scan QR Identity TARA</p>
              <p className="wqs-instruction-sub">Arahkan kamera ke QR Code, atau unggah foto/screenshot QR</p>
            </div>

            {/* Status / error */}
            {status && (
              <div className="wqs-status">
                <div className="wqs-status-dot" />
                {status}
              </div>
            )}
            {error && (
              <div className="wqs-error">
                <span className="material-icons-round">error_outline</span>
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="wqs-actions">
              <button className="wqs-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <span className="material-icons-round">upload_file</span>
                Unggah dari Galeri
              </button>
              {hasTorch && camState === 'active' && (
                <button className="wqs-torch-btn" onClick={toggleTorch}
                  style={{ background: torchEnabled ? 'var(--cyber-pink)' : 'rgba(255,255,255,0.07)' }}>
                  <span className="material-icons-round">{torchEnabled ? 'flashlight_off' : 'flashlight_on'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .wqs-overlay {
          position: fixed; inset: 0; z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          background: rgba(4, 6, 15, 0.88);
          backdrop-filter: blur(16px);
          padding: 0;
          animation: wqsFade 0.3s ease;
        }
        @keyframes wqsFade { from { opacity: 0; } to { opacity: 1; } }

        /* Mobile: full screen */
        .wqs-modal {
          position: relative;
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          overflow: hidden;
          background: #000;
        }

        /* Camera bg */
        .wqs-camera-bg {
          position: absolute; inset: 0; z-index: 1;
          background: #000;
        }
        #${SCANNER_ID} > div { display: none !important; }
        #${SCANNER_ID} video {
          display: block !important; width: 100% !important;
          height: 100% !important; object-fit: cover !important;
        }
        .wqs-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%);
        }

        /* Top HUD */
        .wqs-top-hud {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 20px 20px 16px;
          background: linear-gradient(to bottom, rgba(4,6,15,0.85) 0%, transparent 100%);
        }
        .wqs-live-chip {
          display: flex; align-items: center; gap: 7px;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(10px);
          border: 1px solid; border-radius: 100px;
          padding: 6px 14px;
          font-size: 0.62rem; font-weight: 800; letter-spacing: 1.2px;
          color: #fff;
        }
        .wqs-live-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
        @keyframes wqsPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .wqs-close-btn {
          position: absolute; right: 16px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .wqs-close-btn:hover { background: rgba(255,255,255,0.15); }

        /* Center */
        .wqs-center {
          flex: 1; position: relative; z-index: 5;
          display: flex; align-items: center; justify-content: center;
        }

        /* Camera states */
        .wqs-cam-state {
          position: absolute; inset: 0; z-index: 6;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          color: #9ca3af; font-size: 0.82rem;
        }
        .wqs-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: var(--cyber-pink, #ff4d8d);
          animation: wqsSpin 0.85s linear infinite;
          margin-bottom: 8px;
        }
        @keyframes wqsSpin { to { transform: rotate(360deg); } }
        .wqs-no-cam { font-size: 48px; color: #374151; margin-bottom: 4px; }
        .wqs-retry {
          margin-top: 8px;
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 8px 16px;
          color: #6b7280; font-size: 0.78rem; cursor: pointer;
          transition: all 0.2s;
        }
        .wqs-retry:hover { color: #9ca3af; background: rgba(255,255,255,0.09); }
        .wqs-retry .material-icons-round { font-size: 16px; }

        /* Success overlay */
        .wqs-success-overlay {
          position: absolute; inset: 0; z-index: 8;
          display: flex; align-items: center; justify-content: center;
          background: rgba(16,185,129,0.1);
          animation: wqsFade 0.2s ease;
        }
        .wqs-success-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: #10b981;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 60px rgba(16,185,129,0.5), 0 0 120px rgba(16,185,129,0.2);
          animation: wqsPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .wqs-success-ring .material-icons-round { color: #fff; font-size: 44px; }
        @keyframes wqsPop { from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* QR Frame */
        .wqs-frame-wrap {
          position: absolute; inset: 0; pointer-events: none; z-index: 4;
          display: flex; align-items: center; justify-content: center;
        }
        .wqs-frame {
          position: relative;
          width: min(68vw, 260px);
          height: min(68vw, 260px);
          overflow: hidden;
        }
        .wqs-c {
          position: absolute; width: 32px; height: 32px;
          border-color: var(--cyber-pink, #ff4d8d); border-style: solid;
          filter: drop-shadow(0 0 8px var(--cyber-pink, #ff4d8d));
        }
        .wqs-tl { top:0;left:0;  border-width:3px 0 0 3px; border-radius:8px 0 0 0; }
        .wqs-tr { top:0;right:0; border-width:3px 3px 0 0; border-radius:0 8px 0 0; }
        .wqs-bl { bottom:0;left:0;  border-width:0 0 3px 3px; border-radius:0 0 0 8px; }
        .wqs-br { bottom:0;right:0; border-width:0 3px 3px 0; border-radius:0 0 8px 0; }
        .wqs-laser {
          position: absolute; left: 4px; right: 4px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyber-pink, #ff4d8d), #fff8, var(--cyber-pink, #ff4d8d), transparent);
          box-shadow: 0 0 12px var(--cyber-pink, #ff4d8d);
          border-radius: 2px;
          animation: wqsLaser 2.2s ease-in-out infinite;
        }
        @keyframes wqsLaser {
          0%   { top: 4px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: calc(100% - 6px); opacity: 0; }
        }

        /* Bottom sheet */
        .wqs-bottom {
          position: relative; z-index: 10;
          background: linear-gradient(to top, rgba(4,6,15,0.98) 70%, transparent);
          padding: 32px 24px calc(env(safe-area-inset-bottom) + 28px);
        }
        .wqs-bottom-inner {
          max-width: 360px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 14px;
        }
        .wqs-instruction { text-align: center; }
        .wqs-instruction-title {
          color: #f3f4f6; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;
        }
        .wqs-instruction-sub {
          color: #4b5563; font-size: 0.78rem; line-height: 1.5;
        }

        /* Status */
        .wqs-status {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: #93c5fd; font-size: 0.82rem; font-weight: 600;
        }
        .wqs-status-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; flex-shrink: 0;
          animation: wqsPulse 1s ease-in-out infinite;
        }

        /* Error */
        .wqs-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 11px 14px;
          color: #f87171; font-size: 0.8rem; font-weight: 500;
          animation: wqsFade 0.2s ease;
        }
        .wqs-error .material-icons-round { font-size: 17px; flex-shrink: 0; }

        /* Actions */
        .wqs-actions {
          display: flex; gap: 10px; align-items: stretch;
        }
        .wqs-upload-btn {
          flex: 1; height: 54px;
          background: var(--cyber-pink, #ff4d8d);
          border: none; border-radius: 16px;
          color: #fff; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; gap: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(255,77,141,0.25);
          transition: all 0.2s ease;
        }
        .wqs-upload-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .wqs-upload-btn:active { transform: scale(0.98); }
        .wqs-torch-btn {
          width: 54px; height: 54px; flex-shrink: 0;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .wqs-torch-btn .material-icons-round { font-size: 22px; }

        /* ── Desktop: modal card ── */
        @media (min-width: 640px) {
          .wqs-overlay { padding: 24px; }
          .wqs-modal {
            width: 420px;
            height: auto;
            max-height: 88vh;
            border-radius: 28px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
            overflow: hidden;
          }
          .wqs-camera-bg { position: relative; aspect-ratio: 1/1; height: auto; }
          .wqs-center { position: absolute; inset: 0; }
          .wqs-modal { display: flex; flex-direction: column; }
          .wqs-bottom { background: #0d0e12; }
          .wqs-upload-btn { height: 50px; border-radius: 14px; }
          .wqs-torch-btn { height: 50px; border-radius: 12px; }
        }
      `}</style>
    </div>
  );
};
