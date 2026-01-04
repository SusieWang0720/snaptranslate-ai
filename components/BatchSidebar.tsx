import React from 'react';
import { BatchItem, TranslationStatus } from '../types';
import { CheckCircle2, AlertCircle, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface BatchSidebarProps {
  items: BatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
  onAddImages: (files: FileList | null) => void;
  disabled: boolean;
}

export const BatchSidebar: React.FC<BatchSidebarProps> = ({
  items,
  selectedId,
  onSelect,
  onRemove,
  onAddImages,
  disabled
}) => {
  
  const getStatusIcon = (status: TranslationStatus) => {
    switch (status) {
      case TranslationStatus.COMPLETED:
        return <CheckCircle2 size={16} className="text-green-500" />;
      case TranslationStatus.ERROR:
        return <AlertCircle size={16} className="text-red-500" />;
      case TranslationStatus.PROCESSING:
        return <Loader2 size={16} className="text-brand-400 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />;
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-800/50 border-r border-slate-700/50 flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">Queue ({items.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group
              ${selectedId === item.id 
                ? 'bg-brand-900/30 ring-1 ring-brand-500/50' 
                : 'hover:bg-slate-700/50 border border-transparent hover:border-slate-700'
              }
            `}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 bg-slate-900 rounded overflow-hidden flex-shrink-0 relative">
              <img 
                src={item.originalUrl} 
                alt="thumb" 
                className="w-full h-full object-cover" 
              />
              {/* Status Overlay on Thumb */}
              <div className="absolute bottom-0 right-0 p-0.5 bg-slate-900/80 rounded-tl-md">
                 {getStatusIcon(item.status)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${selectedId === item.id ? 'text-brand-200' : 'text-slate-300'}`}>
                {item.file.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {item.status === TranslationStatus.COMPLETED 
                  ? 'Translated' 
                  : item.status === TranslationStatus.PROCESSING 
                    ? 'Processing...' 
                    : item.status === TranslationStatus.ERROR 
                      ? 'Failed'
                      : 'Pending'}
              </p>
            </div>

            {/* Remove Button */}
            {!disabled && (
              <button
                onClick={(e) => onRemove(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-all"
                title="Remove"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="p-4 text-center text-slate-500 text-sm">
            No images in queue
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700/50 bg-slate-800/80">
        <ImageUploader 
          onImagesSelected={onAddImages} 
          disabled={disabled}
          compact={true}
        />
      </div>
    </div>
  );
};