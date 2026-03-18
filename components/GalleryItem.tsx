
import React from 'react';
import { ProcessedImage } from '../types';

interface GalleryItemProps {
  image: ProcessedImage;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ image }) => {
  const isCompleted = image.status === 'completed';
  const isProcessing = image.status === 'processing';
  const isPending = image.status === 'pending';
  const isError = image.status === 'error';

  return (
    <div className="relative group bg-[#001D4D]/20 border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#E1002F]/50 hover:shadow-[0_0_30px_rgba(225,0,47,0.2)] skew-box">
      <div className="unskew-content">
        <div className="aspect-[4/5] w-full relative overflow-hidden bg-black">
          <img 
            src={isCompleted ? image.processedUrl : image.originalUrl} 
            alt={image.name}
            className={`w-full h-full object-cover transition-all duration-700 ${isProcessing ? 'scale-110 blur-sm opacity-50' : isPending ? 'opacity-30 grayscale' : 'scale-100 opacity-100 group-hover:scale-110'}`}
          />
          
          {/* Action Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#E1002F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <div className="flex gap-2">
                <a 
                  href={image.processedUrl} 
                  download={`redbull-${image.name}`}
                  className="flex-1 bg-white text-[#E1002F] py-3 font-black uppercase text-center text-sm hover:bg-[#FFCC00] hover:text-black transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download
                </a>
                <button 
                  onClick={() => window.open(image.processedUrl, '_blank')}
                  className="bg-black/50 text-white p-3 hover:bg-black transition-colors"
                >
                  <i className="fas fa-expand"></i>
                </button>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#001D4D]/60 backdrop-blur-sm">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#FFCC00]/20 border-t-[#FFCC00] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-bolt text-[#FFCC00] animate-pulse"></i>
                </div>
              </div>
              <span className="mt-4 font-oswald font-bold text-[#FFCC00] uppercase tracking-widest text-sm">Turbo Syncing...</span>
            </div>
          )}

          {/* Pending Indicator */}
          {isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <i className="fas fa-clock text-white/20 text-3xl mb-2"></i>
              <span className="font-oswald font-bold text-white/40 uppercase tracking-widest text-[10px]">Queued</span>
            </div>
          )}

          {isError && (
            <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center p-6 text-center">
              <i className="fas fa-bolt-slash text-white text-4xl mb-4"></i>
              <span className="font-oswald font-bold text-white uppercase text-sm tracking-tight">{image.error || 'System Malfunction'}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#001D4D]/80 border-t border-white/5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter truncate w-32">{image.name}</p>
            <span className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
              isCompleted ? 'bg-green-500 text-black' : 
              isProcessing ? 'bg-[#FFCC00] text-black animate-pulse' : 
              isPending ? 'bg-white/10 text-white/30' :
              isError ? 'bg-[#E1002F] text-white' : 'bg-white/10 text-white/50'
            }`}>
              {image.status}
            </span>
          </div>
          <div className="h-0.5 w-full bg-white/5 overflow-hidden">
            {isProcessing && <div className="h-full energy-gradient animate-[move-lines_1s_infinite]"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
