// worker.ts - Cloudflare Worker for Rosetta Translate API

import OpenAI from "npm:openai";

// =============================================================================
// --- CONFIGURATION ---
// =============================================================================

const MODEL = "anthropic/claude-3.5-sonnet";

const SYSTEM_PROMPT = `You are a professional and highly accurate translator. 
Translate the following English text to German. 
Preserve the original formatting, tone, and any special markers like speaker names (e.g., "John Doe:").
Do not add any commentary, introductions, or explanations. Only provide the direct German translation of the text provided.`;

// =============================================================================

interface TranslateRequest {
  text: string;
  apiKey?: string;
}

interface TranslateResponse {
  translatedText: string;
  chunks: number;
  model: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

async function callAI(textChunk: string, openai: OpenAI): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: textChunk },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content?.trim() || "";

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    } else {
      throw new Error(`Unknown error during API call`);
    }
  }
}

async function translateText(text: string, apiKey: string): Promise<TranslateResponse> {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/arvid-berndtsson/rosetta-translate',
      'X-Title': 'Rosetta Translate',
    },
  });

  // Split text into chunks by paragraphs
  const chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim() !== "");
  
  if (chunks.length === 0) {
    throw new Error("Input text is empty or contains no content to translate");
  }

  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    const translatedChunk = await callAI(chunk, openai);
    translatedChunks.push(translatedChunk);
  }

  const fullTranslatedText = translatedChunks.join("\n\n");

  return {
    translatedText: fullTranslatedText,
    chunks: chunks.length,
    model: MODEL,
  };
}

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Handle GET request - return API information
    if (request.method === 'GET') {
      const info = {
        service: 'Rosetta Translate API',
        version: '1.3.0',
        description: 'Translate large text files from English to German using AI',
        endpoints: {
          'POST /translate': 'Translate text',
        },
        usage: {
          method: 'POST',
          endpoint: '/translate',
          body: {
            text: 'Text to translate (required)',
            apiKey: 'OpenRouter API key (optional if set in environment)',
          },
        },
      };

      return new Response(JSON.stringify(info, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Handle POST request - translation
    if (request.method === 'POST') {
      try {
        const contentType = request.headers.get('Content-Type') || '';
        
        if (!contentType.includes('application/json')) {
          const errorResponse: ErrorResponse = {
            error: 'Content-Type must be application/json',
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const body = await request.json() as TranslateRequest;

        // Validate request body
        if (!body.text || typeof body.text !== 'string') {
          const errorResponse: ErrorResponse = {
            error: 'Missing or invalid "text" field in request body',
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Get API key from request body or environment
        const apiKey = body.apiKey || env.OPENROUTER_API_KEY;

        if (!apiKey) {
          const errorResponse: ErrorResponse = {
            error: 'API key not provided',
            details: 'Please provide an OpenRouter API key in the request body or set OPENROUTER_API_KEY environment variable',
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Perform translation
        const result = await translateText(body.text, apiKey);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: 'Translation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Method not allowed
    const errorResponse: ErrorResponse = {
      error: 'Method not allowed',
      details: `Method ${request.method} is not supported`,
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};
