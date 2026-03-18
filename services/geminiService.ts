
import { GoogleGenAI } from "@google/genai";
import { ModelName } from "../types";

const PROMPT = `Transform this image into a multi-style artistic masterpiece. 

STYLE FOR THE MAIN SUBJECT:
The central subject from the original photo must be rendered as a professional line-and-wash illustration:
- Variable Line Weight: Use a fine-liner or dip pen style where lines vary slightly in thickness.
- Contour Drawing: Define shapes with clear, confident black outlines.
- Digital Watercolor Layering: Apply colors with visible layering and transparency, mimicking real-world watercolor on paper.
- Stippling and Hatching: Instead of smooth gradients, use traditional ink drawing techniques like fine cross-hatching and stippling for shadows.
- White Highlights: Include crisp, sharp white highlights for depth and sparkle.

STYLE FOR THE BACKGROUND:
The entire background behind the subject must be a crisp, high-contrast digital illustration with clean ink outlines, flat vector art design, and bold shading. 
- Edge-to-Edge Coverage: CRITICAL: The doodle composition must completely fill the entire background area, extending all the way to all four edges of the image frame. Ensure there is absolutely no empty space or plain background visible; every pixel not occupied by the main subject must be filled with doodles.
- Content: Fill the negative space with a dense, high-density whimsical composition of hand-drawn doodles including notebooks, laptops, pencils/pens, binary code, robots, redbull cans, swirls, stars, clouds, and patterns.
- Palette: These background doodles must be rendered exclusively using these three colors: #001D4D, #E1002F, and #FFFFFF.

The final result should feature a striking contrast between the organic, textured 'ink and wash' subject and the clean, bold 'flat vector' doodle background that stretches to the very limits of the frame.`;

export async function processImageWithGemini(base64Data: string, mimeType: string, retries = 3): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: ModelName.IMAGE_EDIT,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: PROMPT,
            },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("No response from AI");

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("No image data found in AI response");
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && attempt < retries) {
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("Gemini Error:", error);
      throw error;
    }
  }
  throw new Error("Maximum retries exceeded");
}
