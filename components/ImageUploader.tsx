import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (files: FileList | null) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImagesSelected, 
  disabled = false,
  compact = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImagesSelected(event.target.files);
    }
    // Reset input value to allow selecting the same file again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        flex flex-col items-center justify-center 
        border-2 border-dashed rounded-xl transition-all duration-300
        ${disabled 
          ? 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed' 
          : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-brand-500 cursor-pointer'
        }
        ${compact ? 'p-4 h-32' : 'w-full h-full min-h-[300px]'}
      `}
    >
      <input 
        type="file" 
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        multiple // Enable multiple files
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center text-center">
        <div className={`rounded-full bg-slate-700 flex items-center justify-center text-brand-500 ${compact ? 'w-10 h-10 mb-2' : 'w-16 h-16 mb-4'}`}>
          <Upload size={compact ? 20 : 32} />
        </div>
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-white mb-1`}>
          {compact ? 'Add Images' : 'Upload Images'}
        </h3>
        {!compact && (
          <p className="text-slate-400 text-sm max-w-xs">
            Drag & drop multiple images here
          </p>
        )}
      </div>
    </div>
  );
};