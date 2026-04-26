import { MODEL_NAME, VENUS_CHAT_URL } from '../constants';
import { TargetLanguage } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface VenusContentPart {
  type: string;
  text?: string;
  image_url?: { url: string };
  venus_multimodal_url?: { mimeType?: string; url?: string; encoded?: string };
  gemini_multimodal_url?: { mimeType?: string; url?: string; encoded?: string };
}

interface VenusChoice {
  index?: number;
  message?: {
    role?: string;
    content?: string | VenusContentPart[];
  };
  finish_reason?: string;
}

interface VenusResponse {
  id?: string;
  model?: string;
  choices?: VenusChoice[];
  error?: { message?: string; type?: string; code?: string };
  venusMarker?: { spanId?: string };
}

const extractImageFromResponse = (data: VenusResponse): string | null => {
  const content = data?.choices?.[0]?.message?.content;
  if (!Array.isArray(content)) return null;

  for (const part of content) {
    const mm = part.venus_multimodal_url || part.gemini_multimodal_url;
    if (mm) {
      const { url, encoded, mimeType } = mm;
      if (url && url.startsWith('data:')) return url;
      if (url && /^https?:\/\//.test(url)) return url;
      if (encoded) return `data:${mimeType || 'image/png'};base64,${encoded}`;
    }
    if (part.type === 'image_url' && part.image_url?.url) {
      return part.image_url.url;
    }
  }
  return null;
};

const extractTextFromResponse = (data: VenusResponse): string | null => {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textPart = content.find(p => p.type === 'text' && p.text);
    return textPart?.text ?? null;
  }
  return null;
};

export const translateImage = async (
  base64Data: string,
  mimeType: string,
  targetLanguage: TargetLanguage
): Promise<string> => {
  const apiKey =
    process.env.VENUS_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('API Key is missing. Please check your environment configuration.');
  }

  const prompt = `
Translate every visible piece of text in this image into ${targetLanguage}.
Erase the original text and seamlessly in-fill the background where it used to be.
Render the ${targetLanguage} translation in the exact same positions, matching the
original font style, weight, size, color, rotation, and perspective. Do not alter
the aspect ratio, resolution, or any non-text visual elements. Return only the
edited image.
`.trim();

  const payload = {
    model: MODEL_NAME,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'gemini_multimodal_url',
            gemini_multimodal_url: {
              mimeType,
              encoded: base64Data,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.1,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const maxAttempts = 5;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(VENUS_CHAT_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: VenusResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as VenusResponse) : null;
      } catch {
        // Non-JSON body; keep raw for error reporting.
      }

      if (!response.ok) {
        const apiMessage = data?.error?.message || raw || `HTTP ${response.status}`;
        const isRetriable =
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504;

        if (isRetriable && attempt < maxAttempts - 1) {
          const waitTime = Math.min(3000 * Math.pow(2, attempt), 30000);
          console.warn(
            `Venus chat ${response.status}. Retrying in ${waitTime / 1000}s (${attempt + 1}/${maxAttempts})`
          );
          await delay(waitTime);
          continue;
        }

        const err: any = new Error(apiMessage);
        err.status = response.status;
        err.body = data || raw;
        throw err;
      }

      if (!data) throw new Error('Empty response from Venus.');

      const imageUrl = extractImageFromResponse(data);
      if (imageUrl) return imageUrl;

      const text = extractTextFromResponse(data);
      if (text) {
        console.warn('Model returned text instead of image:', text);
        throw new Error(
          'The model returned a text description instead of the edited image. Please try again or use a clearer image.'
        );
      }

      throw new Error('The model did not return a valid image.');
    } catch (error: any) {
      lastError = error;
      console.error(`Venus chat attempt ${attempt + 1} failed:`, error);

      const status: number | undefined = error?.status;
      const retriable = status === 429 || (status && status >= 500 && status <= 599);
      const networky =
        !status && (error?.name === 'TypeError' || /fetch|network/i.test(error?.message || ''));

      if ((retriable || networky) && attempt < maxAttempts - 1) {
        const waitTime = Math.min(3000 * Math.pow(2, attempt), 30000);
        console.warn(`Retrying in ${waitTime / 1000}s (${attempt + 1}/${maxAttempts})`);
        await delay(waitTime);
        continue;
      }

      break;
    }
  }

  let finalErrorMessage = lastError?.message || 'Failed to process image translation.';
  const errorString = JSON.stringify(lastError?.body || lastError || {});

  if (
    lastError?.status === 401 ||
    lastError?.status === 403 ||
    /PERMISSION_DENIED|unauthorized|forbidden/i.test(errorString)
  ) {
    finalErrorMessage = 'PERMISSION_DENIED';
  } else if (lastError?.status === 503 || /overloaded|UNAVAILABLE/i.test(errorString)) {
    finalErrorMessage = 'Service is busy. Please try again in a few minutes.';
  } else if (/User location is not supported/i.test(errorString)) {
    finalErrorMessage = 'User location is not supported. Please check your VPN/Region settings.';
  }

  throw new Error(finalErrorMessage);
};
