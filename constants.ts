import { TargetLanguage } from './types';

export const SUPPORTED_LANGUAGES = [
  { value: TargetLanguage.CHINESE_SIMPLIFIED, label: '🇨🇳 Chinese (Simplified)' },
  { value: TargetLanguage.CHINESE_TRADITIONAL, label: '🇭🇰 Chinese (Traditional)' },
  { value: TargetLanguage.ENGLISH, label: '🇺🇸 English' },
  { value: TargetLanguage.JAPANESE, label: '🇯🇵 Japanese' },
  { value: TargetLanguage.KOREAN, label: '🇰🇷 Korean' },
  { value: TargetLanguage.SPANISH, label: '🇪🇸 Spanish' },
  { value: TargetLanguage.FRENCH, label: '🇫🇷 French' },
  { value: TargetLanguage.GERMAN, label: '🇩🇪 German' },
  { value: TargetLanguage.ITALIAN, label: '🇮🇹 Italian' },
  { value: TargetLanguage.PORTUGUESE, label: '🇧🇷 Portuguese' },
  { value: TargetLanguage.RUSSIAN, label: '🇷🇺 Russian' },
  { value: TargetLanguage.VIETNAMESE, label: '🇻🇳 Vietnamese' },
  { value: TargetLanguage.THAI, label: '🇹🇭 Thai' },
  { value: TargetLanguage.INDONESIAN, label: '🇮🇩 Indonesian' },
  { value: TargetLanguage.ARABIC, label: '🇸🇦 Arabic' },
];

// Upgraded to Gemini 3 Pro Image Preview (Nano Banana Pro)
export const MODEL_NAME = 'gemini-3-pro-image-preview';