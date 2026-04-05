import { describe, it, expect } from "vitest";
import * as dotenv from "dotenv";
import { resolve } from "path";
// Load env vars from project root
dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

describe("Resend API credentials", () => {
  it("RESEND_API_KEY is defined and starts with re_", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key, "RESEND_API_KEY must be set").toBeTruthy();
    expect(key!.startsWith("re_"), "RESEND_API_KEY must start with re_").toBe(true);
  });

  it("can reach Resend API with the provided key", async () => {
    const key = process.env.RESEND_API_KEY!;
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    // 200 = valid key, 401 = invalid key
    expect(res.status, `Resend API returned ${res.status} — check RESEND_API_KEY`).toBe(200);
  });
});
