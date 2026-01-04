import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { TargetLanguage } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const translateImage = async (
  base64Data: string,
  mimeType: string,
  targetLanguage: TargetLanguage
): Promise<string> => {
  // Try both API_KEY and GEMINI_API_KEY for compatibility
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Advanced Prompt for Gemini 3 Pro
  // Explicitly structuring the request as an editing/inpainting task.
  const prompt = `
    Perform a professional image editing task.
    Goal: Translate all visible text in the image to ${targetLanguage}.
    
    Instructions:
    1. Detect all text regions in the original image.
    2. Erase the original text completely, in-filling the background texture naturally.
    3. Render the ${targetLanguage} translation in the exact same positions.
    4. Match the original font style, size, color, rotation, and perspective.
    5. Do not change the aspect ratio, resolution, or non-text visual elements.
    
    Return the fully edited image.
  `;

  let attempt = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        // Config for high quality image generation
        config: {
          imageConfig: {
            imageSize: "1K", // Explicitly requesting good resolution
          }
        }
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No response candidates received from Gemini.");
      }

      const parts = candidates[0].content.parts;
      let imageUrl = '';

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Response = part.inlineData.data;
          const responseMimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${responseMimeType};base64,${base64Response}`;
          break;
        }
      }

      if (!imageUrl) {
        const textPart = parts.find(p => p.text);
        if (textPart && textPart.text) {
          console.warn("Model returned text instead of image:", textPart.text);
          throw new Error(`The model returned a text description instead of the edited image. Please try again or use a clearer image.`);
        }
        throw new Error("The model did not return a valid image.");
      }

      return imageUrl;

    } catch (error: any) {
      lastError = error;
      console.error(`Gemini API Attempt ${attempt + 1} failed:`, error);
      
      const errorMessage = error.message || JSON.stringify(error);
      const isInternalError = errorMessage.includes("500") || errorMessage.includes("INTERNAL") || errorMessage.includes("503") || errorMessage.includes("Overloaded");
      
      // If it's a 500 error, retry
      if (isInternalError && attempt < maxAttempts - 1) {
        console.warn(`Encountered internal error (500/503). Retrying in ${(attempt + 1) * 2} seconds...`);
        await delay(2000 * (attempt + 1)); // Wait 2s, 4s, etc.
        attempt++;
        continue;
      }
      
      // If it's not a retriable error (like 400 Bad Request or 403 Permission), break immediately
      break;
    }
  }

  // If we exit the loop without returning, throw the last error
  let finalErrorMessage = lastError?.message || "Failed to process image translation.";
  
  if (lastError?.error && lastError.error.message) {
    finalErrorMessage = lastError.error.message;
  } else if (typeof lastError === 'object' && JSON.stringify(lastError).includes("PERMISSION_DENIED")) {
    finalErrorMessage = "PERMISSION_DENIED";
  } else if (JSON.stringify(lastError).includes("User location is not supported")) {
    finalErrorMessage = "User location is not supported. Please check your VPN/Region settings.";
  }

  throw new Error(finalErrorMessage);
};