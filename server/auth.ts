import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, authSessions } from "../drizzle/schema";

const SALT_ROUNDS = 10;
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Hash a password using bcrypt-like algorithm
 * For production, consider using bcrypt package
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derived) => {
      if (err) reject(err);
      resolve(salt + ":" + derived.toString("hex"));
    });
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derived) => {
      if (err) reject(err);
      resolve(key === derived.toString("hex"));
    });
  });
}

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(authSessions).values({
    userId,
    sessionToken,
    expiresAt,
  });

  return sessionToken;
}

/**
 * Verify a session token and return the user ID if valid
 */
export async function verifySession(
  sessionToken: string
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const session = await db
    .select()
    .from(authSessions)
    .where(eq(authSessions.sessionToken, sessionToken))
    .limit(1);

  if (session.length === 0) return null;

  const sess = session[0];
  if (!sess || new Date(sess.expiresAt) < new Date()) {
    // Session expired, delete it
    await db
      .delete(authSessions)
      .where(eq(authSessions.sessionToken, sessionToken));
    return null;
  }

  return sess.userId;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(authSessions)
    .where(eq(authSessions.sessionToken, sessionToken));
}

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ id: number; email: string; name: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const result = await db.insert(users).values({
    email,
    passwordHash,
    name,
    loginMethod: "email",
    isEmailVerified: false,
  });

  const userId = result[0]?.insertId;
  if (!userId) throw new Error("Failed to create user");

  return {
    id: userId as number,
    email,
    name,
  };
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ id: number; email: string; name: string | null; role: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find user by email
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = userResult[0];
  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // Update last signed in
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return {
    id: user.id,
    email: user.email || "",
    name: user.name,
    role: user.role,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(
  userId: number
): Promise<{ id: number; email: string; name: string | null; role: string } | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];
  return {
    id: user.id,
    email: user.email || "",
    name: user.name,
    role: user.role,
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userResult.length === 0) {
    // Don't reveal if email exists
    return "If an account exists with this email, a reset link has been sent.";
  }

  const user = userResult[0];
  const resetToken = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(users)
    .set({
      passwordResetToken: resetToken,
      passwordResetExpiresAt: expiresAt,
    })
    .where(eq(users.id, user.id));

  return resetToken;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, resetToken))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("Invalid or expired reset token");
  }

  const user = userResult[0];
  if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt) < new Date()) {
    throw new Error("Reset token has expired");
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    })
    .where(eq(users.id, user.id));
}
