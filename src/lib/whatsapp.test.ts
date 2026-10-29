import { describe, expect, it } from "vitest";

import { whatsAppText } from "./whatsapp";

describe("WhatsApp text", () => {
  it("drops the email's greeting and sign-off and leads with the role", () => {
    const text = whatsAppText({
      name: "Mahip Kumar",
      role: "Product Manager",
      company: "Acme",
      body: "Dear Priya,\n\nI led item planning at a retailer.\n\nWarm regards,\nMahip Kumar",
    });
    expect(text.startsWith("Hi, I'm Mahip Kumar about the Product Manager role at Acme.")).toBe(true);
    expect(text).toContain("I led item planning at a retailer.");
    expect(text).not.toContain("Dear Priya");
    expect(text).not.toContain("Warm regards");
  });
});
