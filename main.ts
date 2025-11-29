// main.ts - CLI for Rosetta Translate

import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { translateText, type TranslationConfig } from "./lib/translator.ts";

// =============================================================================
// --- CONFIGURATION ---
// =============================================================================

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";
const DEFAULT_PROVIDER = "openrouter";
const DEFAULT_SOURCE_LANG = "English";
const DEFAULT_TARGET_LANG = "German";

async function main() {
  const { options } = await new Command()
    .name("rosetta-translate")
    .version("2.0.0")
    .description("Translates a text file using AI models via OpenRouter or OpenAI.")
    .option("-i, --input <input:string>", "Input text file to translate.", { required: true })
    .option("-o, --output <output:string>", "Output file for the translated text.", { required: true })
    .option("--api-key <key:string>", "Your API key (OpenRouter or OpenAI). Overrides the .env file.")
    .option("--provider <provider:string>", "Provider: 'openrouter' or 'openai'.", { default: DEFAULT_PROVIDER })
    .option("--model <model:string>", "Model to use for translation.", { default: DEFAULT_MODEL })
    .option("--source-lang <lang:string>", "Source language.", { default: DEFAULT_SOURCE_LANG })
    .option("--target-lang <lang:string>", "Target language.", { default: DEFAULT_TARGET_LANG })
    .parse(Deno.args);

  console.log(`--- Starting Translation Process using ${options.provider} (${options.model}) ---`);

  const env = await load();
  const apiKey = options.apiKey || env["OPENROUTER_API_KEY"] || env["OPENAI_API_KEY"] || Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    console.error("\n❌ Error: API key not found.");
    console.error("   Please provide it via the --api-key flag or by creating a .env file with OPENROUTER_API_KEY or OPENAI_API_KEY.");
    Deno.exit(1);
  }
  console.log("✓ API Key loaded.");

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

  if (sourceText.trim() === "") {
    console.warn("⚠️ Warning: Input file is empty or contains no text to translate.");
    Deno.exit(0);
  }

  const config: TranslationConfig = {
    apiKey,
    provider: options.provider as "openai" | "openrouter",
    model: options.model,
    sourceLang: options.sourceLang,
    targetLang: options.targetLang,
  };

  try {
    console.log("Sending text to AI for translation...");
    
    const result = await translateText(sourceText, config, (current, total) => {
      const progress = `${current}/${total}`;
      Deno.stdout.write(new TextEncoder().encode(`\rTranslating chunk ${progress}... `));
    });
    
    console.log(`\n✓ Translation of all chunks complete.`);

    await Deno.writeTextFile(options.output, result.fullTranslation);
    console.log(`🎉 Translation successfully saved to: ${options.output}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}`);
    } else {
      console.error(`\n❌ An unknown error occurred:`, error);
    }
    Deno.exit(1);
  }

  console.log("--- Translation Process Finished ---");
}

if (import.meta.main) {
  await main();
}
