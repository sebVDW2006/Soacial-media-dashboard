export function safeNextPath(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "/";
  if (!input.startsWith("/")) return "/";
  // Block protocol-relative ("//evil.com") and backslash variants ("/\evil.com")
  if (input.startsWith("//") || input.startsWith("/\\")) return "/";
  return input;
}
