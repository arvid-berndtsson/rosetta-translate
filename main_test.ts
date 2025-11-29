// main_test.ts - Basic test to verify the CLI loads correctly

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("main module can be imported", async () => {
  // This test verifies that the main.ts module can be imported without errors
  const module = await import("./main.ts");
  assertEquals(typeof module, "object");
});
