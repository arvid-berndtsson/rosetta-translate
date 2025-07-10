// main.ts

import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
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
      console.error(`\n❌ OpenAI Library Error: ${error.name} - ${error.message}`);
    } else {
      console.error(`\n❌ An unknown error occurred during the API call:`, error);
    }
    return `[TRANSLATION_FAILED] ${textChunk}`;
  }
}

async function main() {
  const { options } = await new Command()
    .name("rosetta-translate") // <--- FINAL NAME
    .version("1.3.0")
    .description("Translates a text file from English to German using your chosen AI model via OpenRouter.")
    .option("-i, --input <input:string>", "Input text file to translate.", { required: true })
    .option("-o, --output <output:string>", "Output file for the translated text.", { required: true })
    .option("--api-key <key:string>", "Your OpenRouter API key. Overrides the .env file.")
    .parse(Deno.args);

  console.log(`--- Starting Translation Process using OpenRouter (${MODEL}) ---`);

  const env = await load();
  const apiKey = options.apiKey || env["OPENROUTER_API_KEY"] || Deno.env.get("OPENROUTER_API_KEY");

  if (!apiKey) {
    console.error("\n❌ Error: API key not found.");
    console.error("   Please provide it via the --api-key flag or by creating a .env file with OPENROUTER_API_KEY=\"sk-or-yourkey\".");
    Deno.exit(1);
  }
  console.log("✓ API Key loaded.");
  
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/your-username/rosetta-translate', // <--- FINAL NAME
      'X-Title': 'Rosetta Translate', // <--- FINAL NAME
    },
  });
  console.log("✓ OpenAI client initialized for OpenRouter.");

  let sourceText: string;
  try {
    sourceText = await Deno.readTextFile(options.input);
    console.log(`✓ Read source file: ${options.input}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error reading input file: ${error.message}`);
    } else {
      console.error(`\n❌ An unknown error occurred while reading the input file:`, error);
    }
    Deno.exit(1);
  }

  const chunks = sourceText.split(/\n\s*\n/).filter(chunk => chunk.trim() !== "");
  if (chunks.length === 0) {
    console.warn("⚠️ Warning: Input file is empty or contains no text to translate.");
    Deno.exit(0);
  }
  console.log(`ⓘ Text split into ${chunks.length} chunks.`);

  const translatedChunks: string[] = [];
  console.log("Sending chunks to AI for translation...");

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progress = `${i + 1}/${chunks.length}`;
    Deno.stdout.write(new TextEncoder().encode(`\rTranslating chunk ${progress}... `));
    
    const translatedChunk = await callAI(chunk, openai);
    translatedChunks.push(translatedChunk);
  }
  
  console.log(`\n✓ Translation of all chunks complete.`);

  const fullTranslatedText = translatedChunks.join("\n\n");
  try {
    await Deno.writeTextFile(options.output, fullTranslatedText);
    console.log(`🎉 Translation successfully saved to: ${options.output}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error writing output file: ${error.message}`);
    } else {
      console.error(`\n❌ An unknown error occurred while writing the output file:`, error);
    }
    Deno.exit(1);
  }

  console.log("--- Translation Process Finished ---");
}

if (import.meta.main) {
  await main();
}
