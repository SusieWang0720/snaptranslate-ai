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

// Venus endpoints. We always go through the Vite dev/preview proxy
// (`/venus-api/*`) so the browser stays same-origin and avoids the CORS
// preflight that Venus' gateway rejects with 403.
export const VENUS_CHAT_URL = '/venus-api/llmproxy/chat/completions';
export const VENUS_IMAGE_EDITS_URL = '/venus-api/chatproxy/images/edits';

// gemini-3-pro-image goes through the OpenAI-compatible chat/completions
// endpoint with multimodal in/out (Venus normalizes the response shape).
// It preserves source aspect ratio and runs ~3x faster than gpt-image-2.
export const MODEL_NAME = 'gemini-3-pro-image';