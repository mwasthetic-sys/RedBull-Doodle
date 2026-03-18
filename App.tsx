
import React, { useState, useCallback, useRef } from 'react';
import { ProcessedImage, ProcessingStatus } from './types';
import { processImageWithGemini } from './services/geminiService';
import Header from './components/Header';
import GalleryItem from './components/GalleryItem';

const LOGO_URL = "https://i.imgur.com/YU8r7sv.png";

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Overlays the Red Bull Basement logo on the bottom center of the image.
   */
  const applyLogoOverlay = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Could not get canvas context"));

      const mainImg = new Image();
      const logoImg = new Image();

      logoImg.crossOrigin = "anonymous";
      mainImg.src = base64Image;

      mainImg.onload = () => {
        logoImg.src = LOGO_URL;
        logoImg.onload = () => {
          canvas.width = mainImg.width;
          canvas.height = mainImg.height;

          // Draw the original processed image
          ctx.drawImage(mainImg, 0, 0);

          // Calculate logo size (roughly 22% of image width)
          const logoWidth = canvas.width * 0.22;
          const aspectRatio = logoImg.width / logoImg.height;
          const logoHeight = logoWidth / aspectRatio;

          // Position at bottom center with some padding
          const padding = canvas.height * 0.05;
          const x = (canvas.width - logoWidth) / 2;
          const y = canvas.height - logoHeight - padding;

          // Add a subtle drop shadow to the logo for better visibility on dark doodled backgrounds
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;

          ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);

          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => {
          // If logo fails, just return original image
          console.warn("Logo failed to load for overlay");
          resolve(base64Image);
        };
      };
      mainImg.onerror = reject;
    });
  };

  const addFilesToQueue = (files: FileList | File[]) => {
    const newImages: ProcessedImage[] = Array.from(files).map((file: File) => ({
      id: crypto.randomUUID(),
      originalUrl: URL.createObjectURL(file),
      name: file.name,
      status: 'idle',
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    addFilesToQueue(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFilesToQueue(files);
    }
  };

  const runBatchProcessing = async () => {
    if (isProcessing) return;
    
    const idleImages = images.filter(img => img.status === 'idle');
    if (idleImages.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: idleImages.length });

    for (const image of idleImages) {
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'processing' } : img
      ));

      try {
        const blob = await fetch(image.originalUrl).then(r => r.blob());
        const base64 = await fileToBase64(new File([blob], image.name, { type: blob.type }));
        
        // 1. Get AI generation
        const rawProcessedUrl = await processImageWithGemini(base64, blob.type);
        
        // 2. Apply branding overlay
        const brandedUrl = await applyLogoOverlay(rawProcessedUrl);

        setImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'completed', 
            processedUrl: brandedUrl 
          } : img
        ));
      } catch (err: any) {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'error', 
            error: err.message || "Power Failure" 
          } : img
        ));
      }
      setProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.processedUrl);
    if (completedImages.length === 0) return;

    setDownloadingAll(true);
    
    for (let i = 0; i < completedImages.length; i++) {
      const img = completedImages[i];
      const link = document.createElement('a');
      link.href = img.processedUrl!;
      link.download = `redbull-doodle-${img.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setDownloadingAll(false);
  };

  const clearAll = () => {
    setImages([]);
    setProgress({ current: 0, total: 0 });
  };

  const hasCompleted = images.some(img => img.status === 'completed');
  const hasIdle = images.some(img => img.status === 'idle');

  return (
    <div className="min-h-screen pb-32">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Energetic Controls */}
        <div className="flex flex-col items-center mb-20">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`action-button energy-gradient px-10 py-5 font-black text-white uppercase tracking-widest shadow-[0_10px_40px_rgba(225,0,47,0.4)] hover:shadow-[0_15px_60px_rgba(225,0,47,0.6)] transition-all duration-300 ${isDragging ? 'scale-110 brightness-125' : ''}`}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <i className={`fas ${isDragging ? 'fa-arrow-down animate-bounce' : 'fa-plus-circle'} text-[#FFCC00]`}></i>
                {isDragging ? 'Drop to Load' : 'Import Media'}
              </div>
            </button>
            
            {hasIdle && !isProcessing && (
              <button
                onClick={runBatchProcessing}
                className="action-button bg-[#FFCC00] px-10 py-5 font-black text-black uppercase tracking-widest shadow-[0_10px_40px_rgba(255,204,0,0.3)] hover:shadow-[0_15px_60px_rgba(255,204,0,0.5)]"
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-bolt"></i>
                  Ignite Transformation
                </div>
              </button>
            )}

            {hasCompleted && (
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className={`action-button bg-white px-10 py-5 font-black text-black uppercase tracking-widest shadow-xl border-l-8 border-[#E1002F] ${downloadingAll ? 'opacity-50' : ''}`}
              >
                {downloadingAll ? 'Exporting...' : 'Export All Results'}
              </button>
            )}

            {images.length > 0 && !isProcessing && (
              <button
                onClick={clearAll}
                className="font-oswald font-bold text-white/30 hover:text-[#E1002F] transition-colors uppercase tracking-[0.3em] text-[10px] mt-2 px-4"
              >
                Purge Engine
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />

          {isProcessing && (
            <div className="w-full max-w-2xl mt-12 px-6">
              <div className="flex justify-between font-oswald font-bold text-[#FFCC00] uppercase tracking-widest text-sm mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 bg-[#E1002F] animate-ping rounded-full"></span>
                  Batch Execution in Progress
                </div>
                <span>{progress.current} / {progress.total} Units</span>
              </div>
              <div className="h-4 w-full bg-white/5 border border-white/10 p-1">
                <div 
                  className="h-full energy-gradient transition-all duration-300 relative"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                >
                  <div className="absolute top-0 right-0 h-full w-4 bg-[#FFCC00] shadow-[0_0_20px_#FFCC00]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Gallery */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {images.map((image) => (
              <GalleryItem key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-10">
            <div className="relative mb-8">
              <i className="fas fa-bolt text-[200px] text-white"></i>
            </div>
            <h3 className="font-oswald font-black text-4xl uppercase italic tracking-tighter">Engine Idle</h3>
            <p className="text-sm uppercase tracking-[0.5em] mt-2">Awaiting Input Media</p>
          </div>
        )}
      </main>

      {/* Decorative Brand Footer */}
      <footer className="mt-40 py-20 bg-gradient-to-t from-black to-transparent border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Basement Logo" className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
            <span className="hover:text-[#FFCC00] cursor-pointer transition-colors">Performance</span>
            <span className="hover:text-[#FFCC00] cursor-pointer transition-colors">Design</span>
            <span className="hover:text-[#FFCC00] cursor-pointer transition-colors">Innovation</span>
          </div>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            &copy; 2025 RED BULL BASEMENT. NO LIMITS.
          </p>
        </div>
      </footer>

      {/* Sticky Mobile HUD */}
      <div className="fixed bottom-0 left-0 w-full p-6 md:hidden z-50 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button
          onClick={() => isProcessing ? null : (images.length === 0 ? fileInputRef.current?.click() : (hasIdle ? runBatchProcessing() : handleDownloadAll()))}
          disabled={isProcessing || downloadingAll}
          className="w-full action-button energy-gradient py-6 font-black text-white uppercase tracking-widest shadow-2xl"
        >
          {isProcessing ? (
             <div className="flex items-center justify-center gap-3">
               <i className="fas fa-circle-notch animate-spin"></i>
               Syncing
             </div>
          ) : downloadingAll ? (
             'Exporting'
          ) : images.length === 0 ? (
             'Load Deck'
          ) : hasIdle ? (
             'Launch'
          ) : (
             'Export Deck'
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
