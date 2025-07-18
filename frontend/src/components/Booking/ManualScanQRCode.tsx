import React, { useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Layout } from '../Layout/Layout';

const validateQRCode = (data: string) => data.includes('/api/bookings/delete/');

const ManualScanQRCode: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'idle'|'processing'|'done'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]); setProgress(0); setTotal(0); setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileArr = Array.from(e.target.files || []);
    if (!fileArr.length) return;
    setStatus('processing'); setTotal(fileArr.length); setProgress(0); setFiles([]);
    let newFiles: any[] = [];
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      let result: any = { fileName: file.name, status: 'pending', message: '', isValid: false, data: '' };
      if (!file.type.startsWith('image/')) {
        result.status = 'error'; result.message = 'File harus berupa gambar';
      } else if (file.size > 5 * 1024 * 1024) {
        result.status = 'error'; result.message = 'Ukuran file terlalu besar (maksimal 5MB)';
      } else {
        result.status = 'processing'; result.message = 'Memproses...';
        const img = new window.Image();
        await new Promise<void>(resolve => {
          img.onload = async () => {
            const canvas = canvasRef.current;
            if (!canvas) { result.status = 'error'; result.message = 'Canvas error'; resolve(); return; }
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { result.status = 'error'; result.message = 'Context error'; resolve(); return; }
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (!code) {
              result.status = 'error'; result.message = 'QR code tidak terdeteksi';
            } else {
              result.data = code.data;
              result.isValid = validateQRCode(code.data);
              if (result.isValid) {
                try {
                  const res = await fetch(code.data, { method: 'DELETE' });
                  if (!res.ok) throw new Error('Gagal hapus booking');
                  result.status = 'success'; result.message = 'Meeting Selesai!';
                } catch (err) {
                  result.status = 'error'; result.message = 'Gagal hapus booking';
                }
              } else {
                result.status = 'error'; result.message = 'QR code tidak valid';
              }
            }
            resolve();
          };
          img.onerror = () => { result.status = 'error'; result.message = 'Gagal muat gambar'; resolve(); };
          img.src = URL.createObjectURL(file);
        });
      }
      newFiles.push(result);
      setProgress(i + 1);
    }
    setFiles(newFiles);
    setStatus('done');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-8 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Upload the QR Code Image when you have finished the meeting!
        </h2>
        <div className="space-y-4">
          {status === 'processing' && total > 0 && (
            <div className="w-full mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${(progress / total) * 100}%` }}></div>
              </div>
              <p className="text-xs mt-1 text-center text-gray-500">Memproses {progress} dari {total} file...</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={status === 'processing'}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {files.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h3 className="font-medium text-gray-700">Status File:</h3>
              {files.map((file, idx) => (
                <div key={idx} className={`p-2 rounded border ${file.status === 'success' ? 'text-green-600' : file.status === 'error' ? 'text-red-600' : 'text-blue-600'}`}> 
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{file.fileName}</span>
                    <span className="text-xs capitalize">{file.status}</span>
                  </div>
                  <p className="text-xs mt-1">{file.message}</p>
                  {file.data && !file.isValid && (
                    <div className="mt-1 p-1 bg-gray-100 rounded text-xs text-gray-600 break-all">
                      <strong>QR Code Data:</strong> {file.data}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {status !== 'idle' && (
            <div className="flex justify-center">
              <button
                onClick={reset}
                disabled={status === 'processing'}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? 'Memproses...' : 'Upload Lagi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManualScanQRCode;