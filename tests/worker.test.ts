import { it, expect } from "vitest";
import { SELF } from "cloudflare:test";

it("should fetch from worker", async () => {
  const response = await SELF.fetch("http://localhost/");
  expect(response.status).toBe(200);
  const text = await response.text();
  expect(text).toBe("Hello World!");
});