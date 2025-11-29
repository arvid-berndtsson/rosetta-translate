// lib/translator_test.ts - Tests for the translator module

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createSystemPrompt, splitTextIntoChunks, createOpenAIClient } from "./translator.ts";

Deno.test("createSystemPrompt generates correct prompt", () => {
  const prompt = createSystemPrompt("English", "German");
  
  assertExists(prompt);
  assertEquals(typeof prompt, "string");
  assertEquals(prompt.includes("English"), true);
  assertEquals(prompt.includes("German"), true);
  assertEquals(prompt.includes("translator"), true);
});

Deno.test("splitTextIntoChunks splits by paragraphs", () => {
  const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
  const chunks = splitTextIntoChunks(text);
  
  assertEquals(chunks.length, 3);
  assertEquals(chunks[0], "First paragraph.");
  assertEquals(chunks[1], "Second paragraph.");
  assertEquals(chunks[2], "Third paragraph.");
});

Deno.test("splitTextIntoChunks filters empty chunks", () => {
  const text = "First paragraph.\n\n\n\nSecond paragraph.\n\n";
  const chunks = splitTextIntoChunks(text);
  
  assertEquals(chunks.length, 2);
  assertEquals(chunks[0], "First paragraph.");
  assertEquals(chunks[1], "Second paragraph.");
});

Deno.test("splitTextIntoChunks handles single paragraph", () => {
  const text = "Just one paragraph.";
  const chunks = splitTextIntoChunks(text);
  
  assertEquals(chunks.length, 1);
  assertEquals(chunks[0], "Just one paragraph.");
});

Deno.test("createOpenAIClient creates client with OpenRouter config", () => {
  const config = {
    apiKey: "test-key",
    provider: "openrouter" as const,
    model: "test-model",
    sourceLang: "English",
    targetLang: "German",
  };
  
  const client = createOpenAIClient(config);
  assertExists(client);
});

Deno.test("createOpenAIClient creates client with OpenAI config", () => {
  const config = {
    apiKey: "test-key",
    provider: "openai" as const,
    model: "test-model",
    sourceLang: "English",
    targetLang: "German",
  };
  
  const client = createOpenAIClient(config);
  assertExists(client);
});
