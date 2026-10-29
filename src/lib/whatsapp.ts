/** A recruiter message for WhatsApp: who you are and the email's point, without the letter's frame. */
export function whatsAppText({ name, role, company, body }: { name: string; role: string; company: string; body: string }): string {
  const intro = `Hi, I'm ${name.trim() || "reaching out"} about the ${role.trim() || "open"} role${company.trim() ? ` at ${company.trim()}` : ""}.`;
  const kept = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^(dear|hi|hello|hey)\b/i.test(line) && !/(regards|sincerely),?$/i.test(line) && line !== name.trim());
  return [intro, ...kept.slice(0, 8)].join("\n").slice(0, 900);
}
