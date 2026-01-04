export enum TranslationStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum TargetLanguage {
  CHINESE_SIMPLIFIED = 'Chinese (Simplified)',
  CHINESE_TRADITIONAL = 'Chinese (Traditional)',
  ENGLISH = 'English',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  RUSSIAN = 'Russian',
  PORTUGUESE = 'Portuguese',
  ITALIAN = 'Italian',
  VIETNAMESE = 'Vietnamese',
  THAI = 'Thai',
  INDONESIAN = 'Indonesian',
  ARABIC = 'Arabic'
}

// Deprecated in favor of BatchItem for the new architecture, but kept for compatibility if needed
export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64Data: string | null;
  mimeType: string;
}

export interface BatchItem {
  id: string;
  file: File;
  originalUrl: string; // The display URL (blob or base64)
  base64Data: string; // The raw data for API
  mimeType: string;
  status: TranslationStatus;
  translatedUrl?: string;
  error?: string;
}

export interface TranslationResult {
  imageUrl: string | null;
  promptUsed: string;
}