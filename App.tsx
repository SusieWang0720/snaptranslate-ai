import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LanguageDropdown } from './components/LanguageDropdown';
import { Button } from './components/Button';
import { BatchSidebar } from './components/BatchSidebar';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { translateImage } from './services/geminiService';
import { BatchItem, TranslationStatus, TargetLanguage } from './types';
import { ScanText, ArrowRight, Download, RefreshCw, AlertCircle, Zap, Key, Play, Trash2, Maximize2 } from 'lucide-react';
import { MODEL_NAME } from './constants';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple ID generator since uuid package might not be there, but let's use a helper

// Simple UUID helper to avoid package dependency issues if not installed
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  // Authentication State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  // Application State
  const [items, setItems] = useState<BatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.ENGLISH);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; url: string | null; title: string }>({
    isOpen: false,
    url: null,
    title: ''
  });

  // Derived State
  const selectedItem = items.find(i => i.id === selectedId) || null;
  const completedCount = items.filter(i => i.status === TranslationStatus.COMPLETED).length;

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        // First check AI Studio API (for AI Studio environment)
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          // Check build-time environment variable
          const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
          const hasKey = !!envKey;
          setHasApiKey(hasKey);
          if (!hasKey) {
            console.warn('API Key not configured. Please set GEMINI_API_KEY in GitHub Secrets for deployment.');
          }
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleAddImages = useCallback((files: FileList | null) => {
    if (!files) return;

    const newItems: BatchItem[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      // Basic validation
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Full = reader.result as string;
        const matches = base64Full.match(/^data:(.+);base64,(.+)$/);
        
        if (matches) {
          const newItem: BatchItem = {
            id: generateId(),
            file,
            originalUrl: base64Full,
            base64Data: matches[2],
            mimeType: matches[1],
            status: TranslationStatus.IDLE
          };
          
          setItems(prev => {
            const updated = [...prev, newItem];
            // If it's the first item being added, select it
            if (prev.length === 0) setSelectedId(newItem.id);
            return updated;
          });
          
          // If no item was selected (queue was empty), select this one immediately
          if (items.length === 0) {
             setSelectedId(newItem.id);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    setGlobalError(null);
  }, [items.length]);

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // If we removed the selected item, select the previous one or null
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all images?')) {
      setItems([]);
      setSelectedId(null);
      setGlobalError(null);
    }
  };

  const updateItemStatus = (id: string, status: TranslationStatus, translatedUrl?: string, error?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status, translatedUrl, error };
      }
      return item;
    }));
  };

  const processBatch = async () => {
    const pendingItems = items.filter(i => i.status === TranslationStatus.IDLE || i.status === TranslationStatus.ERROR);
    if (pendingItems.length === 0) return;

    setIsBatchProcessing(true);
    setGlobalError(null);

    // Process sequentially to be safe with rate limits and browser memory
    for (const item of pendingItems) {
      updateItemStatus(item.id, TranslationStatus.PROCESSING);
      
      try {
        const resultUrl = await translateImage(
          item.base64Data,
          item.mimeType,
          targetLanguage
        );
        updateItemStatus(item.id, TranslationStatus.COMPLETED, resultUrl);
      } catch (err: any) {
        console.error(`Error processing ${item.file.name}:`, err);
        const errorMessage = err.message || "Failed";
        
        if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
          setHasApiKey(false);
          setGlobalError("API Key permission denied. Please reconnect.");
          setIsBatchProcessing(false);
          updateItemStatus(item.id, TranslationStatus.ERROR, undefined, "Permission Denied");
          return; // Stop batch
        }
        
        updateItemStatus(item.id, TranslationStatus.ERROR, undefined, errorMessage);
      }
    }
    
    setIsBatchProcessing(false);
  };

  const handleDownloadAll = () => {
    const completed = items.filter(i => i.status === TranslationStatus.COMPLETED && i.translatedUrl);
    
    // Sequential download trigger
    completed.forEach((item, index) => {
      setTimeout(() => {
        if (item.translatedUrl) {
          const link = document.createElement('a');
          link.href = item.translatedUrl;
          link.download = `translated_${item.file.name.split('.')[0]}_${targetLanguage}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, index * 500); // 500ms delay between downloads to prevent browser blocking
    });
  };

  const openPreview = (url: string | undefined, title: string) => {
    if (url) {
      setPreviewModal({ isOpen: true, url, title });
    }
  };

  // --- Renders ---

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">API Key Not Configured</h1>
            <p className="text-slate-400">The API key is not configured. Please contact the administrator.</p>
            <div className="p-3 bg-slate-700/50 border border-slate-600 text-slate-300 text-sm rounded-lg">
              <p className="text-xs">For administrators: Set GEMINI_API_KEY in GitHub Secrets to enable the application.</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* 1. Header */}
      <header className="h-16 flex-shrink-0 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <ScanText size={20} />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
            SnapTranslate AI
          </h1>
        </div>

        <div className="flex items-center gap-4">
           {/* Top Actions */}
           <div className="w-48 sm:w-64">
             <LanguageDropdown selectedLanguage={targetLanguage} onChange={setTargetLanguage} disabled={isBatchProcessing} />
           </div>
           
           <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block"></div>

           <Button 
             onClick={processBatch} 
             isLoading={isBatchProcessing}
             disabled={items.length === 0 || isBatchProcessing}
             className="px-4 py-2 text-sm"
           >
             <Play size={16} className="mr-2 fill-current" />
             Translate All
           </Button>

            {completedCount > 0 && (
              <Button 
                onClick={handleDownloadAll}
                variant="secondary"
                className="px-4 py-2 text-sm"
              >
                <Download size={16} className="mr-2" />
                Export ({completedCount})
              </Button>
            )}

            {items.length > 0 && (
              <Button 
                onClick={handleClearAll}
                variant="secondary"
                disabled={isBatchProcessing}
                className="px-4 py-2 text-sm"
              >
                <Trash2 size={16} className="mr-2" />
                Empty
              </Button>
            )}

        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <BatchSidebar 
          items={items} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
          onRemove={handleRemoveItem}
          onAddImages={handleAddImages}
          disabled={isBatchProcessing}
        />

        {/* Center Stage */}
        <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          
          {globalError && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-900/90 text-white px-4 py-2 rounded-full shadow-lg border border-red-500/50 flex items-center gap-2">
               <AlertCircle size={16} /> {globalError}
             </div>
          )}

          {items.length === 0 ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8">
               <div className="max-w-xl w-full h-64">
                 <ImageUploader 
                   onImagesSelected={handleAddImages} 
                   disabled={isBatchProcessing}
                   showHint={true}
                 />
               </div>
            </div>
          ) : selectedItem ? (
            // Comparison View
            <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6 h-full items-center justify-center overflow-y-auto">
              
              {/* Source */}
              <div className="flex-1 flex flex-col h-full max-h-[80vh] w-full min-w-0">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original</span>
                  <button 
                    onClick={() => openPreview(selectedItem.originalUrl, "Original Image")}
                    className="text-slate-500 hover:text-brand-400 transition-colors"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
                <div 
                  className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden cursor-zoom-in relative group"
                  onClick={() => openPreview(selectedItem.originalUrl, "Original Image")}
                >
                  <img src={selectedItem.originalUrl} className="max-w-full max-h-full object-contain" alt="Original" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={32}/>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-slate-600">
                 <ArrowRight size={24} className="hidden sm:block" />
                 <ArrowRight size={24} className="sm:hidden rotate-90" />
              </div>

              {/* Result */}
              <div className="flex-1 flex flex-col h-full max-h-[80vh] w-full min-w-0">
                <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Translated</span>
                   {selectedItem.translatedUrl && (
                      <button 
                        onClick={() => openPreview(selectedItem.translatedUrl || null, "Translated Result")}
                        className="text-slate-500 hover:text-brand-400 transition-colors"
                      >
                        <Maximize2 size={16} />
                      </button>
                   )}
                </div>
                
                <div 
                  className={`
                    flex-1 rounded-xl border flex items-center justify-center overflow-hidden relative transition-all
                    ${selectedItem.translatedUrl 
                      ? 'bg-slate-900 border-slate-800 cursor-zoom-in group' 
                      : 'bg-slate-900/30 border-slate-800 border-dashed'}
                  `}
                  onClick={() => selectedItem.translatedUrl && openPreview(selectedItem.translatedUrl, "Translated Result")}
                >
                  {selectedItem.status === TranslationStatus.PROCESSING ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-slate-600 border-t-brand-500 rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 animate-pulse">In-painting...</span>
                    </div>
                  ) : selectedItem.translatedUrl ? (
                    <>
                      <img src={selectedItem.translatedUrl} className="max-w-full max-h-full object-contain" alt="Translated" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={32}/>
                      </div>
                    </>
                  ) : selectedItem.status === TranslationStatus.ERROR ? (
                     <div className="text-center p-4">
                       <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                       <p className="text-sm text-red-200">{selectedItem.error || "Translation Failed"}</p>
                     </div>
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                       <RefreshCw size={24} className="opacity-20 mb-2" />
                       <span className="text-xs">Pending</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
               Select an image from the queue
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <ImagePreviewModal 
        isOpen={previewModal.isOpen} 
        imageUrl={previewModal.url} 
        title={previewModal.title}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} 
      />

    </div>
  );
};

export default App;