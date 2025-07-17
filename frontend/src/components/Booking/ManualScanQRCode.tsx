import React, { useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Layout } from '../Layout/Layout';

// --- Types ---
interface ScanResult {
  data: string;
  isValid: boolean;
  fileName: string;
}

interface FileProgress {
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
}

type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

// --- Utility Functions ---
const validateQRCode = (data: string): boolean => {
  return data.includes('/api/bookings/delete/');
};

const getStatusColor = (status: ScanStatus): string => {
  switch (status) {
    case 'success': return 'text-green-600';
    case 'error': return 'text-red-600';
    case 'processing': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

const getFileStatusColor = (status: FileProgress['status']): string => {
  switch (status) {
    case 'success': return 'text-green-600';
    case 'error': return 'text-red-600';
    case 'processing': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

const getButtonText = (status: ScanStatus): string => {
  if (status === 'processing') return 'Memproses...';
  return 'Upload Lagi';
};

// --- Main Component ---
const ManualScanQRCode: React.FC = () => {
  // --- State ---
  const [results, setResults] = useState<ScanResult[]>([]);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [processedFiles, setProcessedFiles] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Reset State ---
  const resetState = useCallback(() => {
    setStatus('idle');
    setMessage('');
    setResults([]);
    setFileProgress([]);
    setTotalFiles(0);
    setProcessedFiles(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // --- API Call to Delete Booking ---
  const deleteBooking = useCallback(async (url: string, fileName: string) => {
    setFileProgress(prev => prev.map(file =>
      file.fileName === fileName
        ? { ...file, status: 'processing', message: 'Menghapus booking...' }
        : file
    ));
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Gagal menghapus booking`);
      }
      setFileProgress(prev => prev.map(file =>
        file.fileName === fileName
          ? { ...file, status: 'success', message: 'Meeting Selesai!' }
          : file
      ));
    } catch (error) {
      setFileProgress(prev => prev.map(file =>
        file.fileName === fileName
          ? { ...file, status: 'error', message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus booking' }
          : file
      ));
    }
  }, []);

  // --- Process QR Code from ImageData ---
  const processQRCode = useCallback(async (imageData: ImageData, fileName: string) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (!code) {
      setFileProgress(prev => prev.map(file =>
        file.fileName === fileName
          ? { ...file, status: 'error', message: 'QR code tidak terdeteksi pada gambar. Pastikan gambar jelas dan mengandung QR code.' }
          : file
      ));
      return;
    }
    const isValid = validateQRCode(code.data);
    setResults(prev => [...prev, { data: code.data, isValid, fileName }]);
    if (isValid) {
      await deleteBooking(code.data, fileName);
    } else {
      setFileProgress(prev => prev.map(file =>
        file.fileName === fileName
          ? { ...file, status: 'error', message: 'QR code tidak valid untuk hapus booking. Pastikan QR code berasal dari sistem booking.' }
          : file
      ));
    }
  }, [deleteBooking]);

  // --- Process a Single File ---
  const processSingleFile = useCallback(async (file: File, fileIndex: number, totalFiles: number) => {
    const fileName = file.name;
    setFileProgress(prev => [...prev, { fileName, status: 'pending', message: 'Menunggu...' }]);
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFileProgress(prev => prev.map(f =>
        f.fileName === fileName
          ? { ...f, status: 'error', message: 'File harus berupa gambar' }
          : f
      ));
      setProcessedFiles(prev => prev + 1);
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileProgress(prev => prev.map(f =>
        f.fileName === fileName
          ? { ...f, status: 'error', message: 'Ukuran file terlalu besar (maksimal 5MB)' }
          : f
      ));
      setProcessedFiles(prev => prev + 1);
      return;
    }
    setFileProgress(prev => prev.map(f =>
      f.fileName === fileName
        ? { ...f, status: 'processing', message: 'Memproses gambar...' }
        : f
    ));
    const img = new window.Image();
    img.onload = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas tidak tersedia');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Context 2D tidak tersedia');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        await processQRCode(imageData, fileName);
      } catch (error) {
        setFileProgress(prev => prev.map(f =>
          f.fileName === fileName
            ? { ...f, status: 'error', message: error instanceof Error ? error.message : 'Gagal memproses gambar' }
            : f
        ));
      } finally {
        URL.revokeObjectURL(img.src);
        setProcessedFiles(prev => prev + 1);
        // If last file, show summary
        if (fileIndex === totalFiles - 1) {
          setTimeout(() => {
            setFileProgress(prev => {
              const successCount = prev.filter(f => f.status === 'success').length;
              const errorCount = prev.filter(f => f.status === 'error').length;
              if (successCount > 0) {
                setStatus('success');
                setMessage(`Berhasil memproses ${successCount} file${errorCount > 0 ? `, ${errorCount} gagal` : ''}`);
              } else {
                setStatus('error');
                setMessage('Tidak ada file yang berhasil diproses');
              }
              return prev;
            });
          }, 100);
        }
      }
    };
    img.onerror = () => {
      setFileProgress(prev => prev.map(f =>
        f.fileName === fileName
          ? { ...f, status: 'error', message: 'Gagal memuat gambar. Pastikan file gambar valid.' }
          : f
      ));
      URL.revokeObjectURL(img.src);
      setProcessedFiles(prev => prev + 1);
      if (fileIndex === totalFiles - 1) {
        setTimeout(() => {
          setFileProgress(prev => {
            const successCount = prev.filter(f => f.status === 'success').length;
            const errorCount = prev.filter(f => f.status === 'error').length;
            if (successCount > 0) {
              setStatus('success');
              setMessage(`Berhasil memproses ${successCount} file${errorCount > 0 ? `, ${errorCount} gagal` : ''}`);
            } else {
              setStatus('error');
              setMessage('Tidak ada file yang berhasil diproses');
            }
            return prev;
          });
        }, 100);
      }
    };
    img.src = URL.createObjectURL(file);
  }, [processQRCode]);

  // --- Handle File Input Change ---
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setStatus('processing');
    setMessage(`Memproses ${files.length} file...`);
    setTotalFiles(files.length);
    setProcessedFiles(0);
    setResults([]);
    setFileProgress([]);
    for (let i = 0; i < files.length; i++) {
      await processSingleFile(files[i], i, files.length);
    }
  }, [processSingleFile]);

  // --- Render ---
  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-8 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Upload Gambar QR Code Bila Sudah Selesai Meeting!
        </h2>
        <div className="space-y-4">
          {/* File Input */}
          <div className="flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={status === 'processing'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              Pilih satu atau lebih file gambar QR code
            </p>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {/* Status Message & Progress Bar */}
          {status !== 'idle' && (
            <div className={`p-3 rounded-md text-center ${getStatusColor(status)}`}>
              {status === 'processing' && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>{message}</span>
                </div>
              )}
              {status !== 'processing' && <span>{message}</span>}
              {totalFiles > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(processedFiles / totalFiles) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">
                    {processedFiles} dari {totalFiles} file diproses
                  </p>
                </div>
              )}
            </div>
          )}
          {/* File Progress List */}
          {fileProgress.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h3 className="font-medium text-gray-700">Status File:</h3>
              {fileProgress.map((file, index) => (
                <div key={index} className={`p-2 rounded border ${getFileStatusColor(file.status)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{file.fileName}</span>
                    <span className="text-xs capitalize">{file.status}</span>
                  </div>
                  {file.message && (
                    <p className="text-xs mt-1">{file.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Results Summary */}
          {results.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-700 mb-2">Hasil Scan:</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{result.fileName}:</span>
                    <span className={`ml-2 ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {result.isValid ? 'Valid' : 'Tidak Valid'}
                    </span>
                    {!result.isValid && (
                      <div className="mt-1 p-1 bg-gray-100 rounded text-xs text-gray-600 break-all">
                        <strong>QR Code Data:</strong> {result.data}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Reset Button */}
          {status !== 'idle' && (
            <div className="flex justify-center">
              <button
                onClick={resetState}
                disabled={status === 'processing'}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {getButtonText(status)}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManualScanQRCode;