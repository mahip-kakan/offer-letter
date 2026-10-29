import "server-only";

import { randomBytes, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

const KEY = "capture.token";

/** The token the browser extension sends. Created the first time Settings asks for it. */
export async function captureToken(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  if (row?.value) return row.value;
  const value = randomBytes(24).toString("base64url");
  await prisma.setting.create({ data: { key: KEY, value } });
  return value;
}

/** True when `given` is the saved token. */
export async function captureTokenMatches(given: string): Promise<boolean> {
  const expected = await captureToken();
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** A draft application holding a posting saved from the browser. */
export async function saveCapturedPosting(text: string, url: string) {
  const title = text.split("\n").map((line) => line.trim()).find(Boolean)?.slice(0, 200) ?? "Saved posting";
  return prisma.application.create({
    data: {
      title,
      postingText: text.slice(0, 20_000),
      postingUrl: /^https?:\/\//i.test(url) ? url.slice(0, 2000) : "",
    },
  });
}
