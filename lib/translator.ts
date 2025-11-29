// packages/shared/translator.ts - Shared translation logic

import OpenAI from "npm:openai";

export interface TranslationConfig {
  apiKey: string;
  provider: "openai" | "openrouter";
  model: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  translatedChunks: string[];
  fullTranslation: string;
}

export function createOpenAIClient(config: TranslationConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.provider === "openrouter" ? "https://openrouter.ai/api/v1" : undefined,
    defaultHeaders: config.provider === "openrouter" ? {
      "HTTP-Referer": "https://github.com/arvid-berndtsson/rosetta-translate",
      "X-Title": "Rosetta Translate",
    } : {},
  });
}

export function createSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are a professional and highly accurate translator. 
Translate the following ${sourceLang} text to ${targetLang}. 
Preserve the original formatting, tone, and any special markers like speaker names (e.g., "John Doe:").
Do not add any commentary, introductions, or explanations. Only provide the direct ${targetLang} translation of the text provided.`;
}

export function splitTextIntoChunks(text: string): string[] {
  return text.split(/\n\s*\n/).filter(chunk => chunk.trim() !== "");
}

export async function translateChunk(
  chunk: string,
  openai: OpenAI,
  config: TranslationConfig
): Promise<string> {
  const systemPrompt = createSystemPrompt(config.sourceLang, config.targetLang);
  
  try {
    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: chunk },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function translateText(
  text: string,
  config: TranslationConfig,
  onProgress?: (current: number, total: number) => void
): Promise<TranslationResult> {
  const openai = createOpenAIClient(config);
  const chunks = splitTextIntoChunks(text);
  const translatedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }
    
    const translatedChunk = await translateChunk(chunks[i], openai, config);
    translatedChunks.push(translatedChunk);
  }

  return {
    translatedChunks,
    fullTranslation: translatedChunks.join("\n\n"),
  };
}
