import { getDb } from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function isLoginLockedOut(ip: string): Promise<boolean> {
  try {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT COUNT(*) AS failures
        FROM login_attempts
        WHERE ip = ?
          AND success = 0
          AND attempted_at >= datetime('now', ?)`,
      args: [ip, `-${WINDOW_MINUTES} minutes`],
    });
    const failures = Number(result.rows[0]?.failures ?? 0);
    return failures >= MAX_FAILURES;
  } catch (err) {
    // Fail open: if the DB is unavailable, login should still work.
    // Logged so an operator can spot a misconfigured deploy.
    console.error("rate-limit check failed", err);
    return false;
  }
}

export async function recordLoginAttempt(ip: string, success: boolean): Promise<void> {
  try {
    const db = await getDb();
    await db.execute({
      sql: "INSERT INTO login_attempts (ip, success) VALUES (?, ?)",
      args: [ip, success ? 1 : 0],
    });
  } catch (err) {
    console.error("rate-limit record failed", err);
  }
}
