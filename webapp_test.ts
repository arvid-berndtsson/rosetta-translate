// webapp_test.ts - Integration tests for the webapp

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("webapp module can be imported", async () => {
  // This test verifies that the webapp.ts module can be imported without errors
  const module = await import("./webapp.ts");
  assertEquals(typeof module, "object");
});

Deno.test("public/index.html exists and is valid", async () => {
  const html = await Deno.readTextFile("./public/index.html");
  
  assertExists(html);
  assertEquals(html.includes("<!DOCTYPE html>"), true);
  assertEquals(html.includes("Rosetta Translate"), true);
  assertEquals(html.includes("API Key"), true);
  assertEquals(html.includes("Provider"), true);
  assertEquals(html.includes("/api/translate"), true);
});

Deno.test("HTML contains required form fields", async () => {
  const html = await Deno.readTextFile("./public/index.html");
  
  // Check for required form elements
  assertEquals(html.includes('id="apiKey"'), true);
  assertEquals(html.includes('id="provider"'), true);
  assertEquals(html.includes('id="model"'), true);
  assertEquals(html.includes('id="sourceLang"'), true);
  assertEquals(html.includes('id="targetLang"'), true);
  assertEquals(html.includes('id="inputText"'), true);
  assertEquals(html.includes('id="outputText"'), true);
});

Deno.test("HTML includes orange accent styling", async () => {
  const html = await Deno.readTextFile("./public/index.html");
  
  // Check for orange color scheme
  assertEquals(html.includes("#ff8c00"), true); // Orange color code
  assertEquals(html.includes("#ffa500"), true); // Orange accent
});
