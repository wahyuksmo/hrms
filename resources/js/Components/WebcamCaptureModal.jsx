import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function WebcamCaptureModal({ isOpen, onClose, onCapture, title = "Ambil Foto Selfie Presensi", mode = "Clock In" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Verifikasi Wajah Presensi Online ({mode})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-100"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Video / Photo Preview Container */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center mb-6">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 space-y-2">
              <AlertTriangle className="w-10 h-10 mx-auto text-rose-500" />
              <p className="text-xs font-bold">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-2 text-xs font-black text-white bg-rose-600 px-4 py-2 rounded-xl hover:bg-rose-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Guidelines Overlay */}
          {!capturedImage && !cameraError && (
            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-44 h-44 rounded-full border-2 border-white/60 border-dashed" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi & Presensi</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={takePhoto}
              disabled={!!cameraError}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto Selfie</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
