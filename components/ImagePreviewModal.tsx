import React, { useEffect } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  title,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl max-h-full w-full flex flex-col items-center">
        {/* Toolbar */}
        <div className="absolute top-0 right-0 -mt-12 flex items-center gap-4">
          {title && <span className="text-slate-300 font-medium">{title}</span>}
          
          <a 
            href={imageUrl} 
            download={`preview_${Date.now()}.png`}
            className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full"
            title="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={24} />
          </a>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full hover:bg-red-500/80"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image */}
        <img 
          src={imageUrl} 
          alt="Full Preview" 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-slate-700"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
};