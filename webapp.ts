// webapp.ts - Web server for Rosetta Translate

import { translateText, type TranslationConfig } from "./lib/translator.ts";

const PORT = 8000;

interface TranslationRequest {
  text: string;
  apiKey: string;
  provider: "openai" | "openrouter";
  model: string;
  sourceLang: string;
  targetLang: string;
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Serve static HTML for root path
  if (url.pathname === "/" && req.method === "GET") {
    try {
      const html = await Deno.readTextFile("./public/index.html");
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("Error loading page", { status: 500 });
    }
  }

  // Handle translation API
  if (url.pathname === "/api/translate" && req.method === "POST") {
    try {
      const body: TranslationRequest = await req.json();

      // Validate required fields
      if (!body.text || !body.apiKey || !body.provider || !body.model || !body.sourceLang || !body.targetLang) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }

      const config: TranslationConfig = {
        apiKey: body.apiKey,
        provider: body.provider,
        model: body.model,
        sourceLang: body.sourceLang,
        targetLang: body.targetLang,
      };

      const result = await translateText(body.text, config);

      return new Response(
        JSON.stringify({ translation: result.fullTranslation }),
        { headers: { "content-type": "application/json" } }
      );
    } catch (error) {
      console.error("API error:", error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }
  }

  // 404 for other routes
  return new Response("Not Found", { status: 404 });
}

if (import.meta.main) {
  console.log(`🌐 Rosetta Translate webapp running on http://localhost:${PORT}`);
  console.log(`📜 Open your browser and navigate to the URL above`);
  
  Deno.serve({ port: PORT }, handler);
}
