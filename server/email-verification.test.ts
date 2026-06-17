import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  registerUser,
  requestEmailVerification,
  verifyEmail,
  requestPasswordReset,
} from "./auth";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

describe("Email Verification System", () => {
  let db: any;
  let testUserId: number;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testName = "Test User";

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const user = await registerUser(testEmail, testPassword, testName);
    testUserId = user.id;
  });

  afterAll(async () => {
    if (db && testUserId) {
      // Clean up test user
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should generate email verification token", async () => {
    const result = await requestEmailVerification(
      testUserId,
      testEmail,
      "https://example.com"
    );

    expect(result).toBe(true);

    // Verify token was stored in database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user[0].emailVerificationToken).toBeTruthy();
    expect(user[0].emailVerificationExpiresAt).toBeTruthy();
  });

  it("should verify email with valid token", async () => {
    // First generate a token
    await requestEmailVerification(testUserId, testEmail, "https://example.com");

    // Get the token from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    const token = user[0].emailVerificationToken;

    // Verify the email
    const result = await verifyEmail(token);
    expect(result).toBe(true);

    // Check that email is now verified
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(updatedUser[0].isEmailVerified).toBe(true);
    expect(updatedUser[0].emailVerificationToken).toBeNull();
  });

  it("should reject invalid verification token", async () => {
    try {
      await verifyEmail("invalid-token-12345");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid verification token");
    }
  });

  it("should generate password reset token", async () => {
    const result = await requestPasswordReset(testEmail, "https://example.com");
    expect(result).toBe(true);

    // Verify token was stored
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user[0].passwordResetToken).toBeTruthy();
    expect(user[0].passwordResetExpiresAt).toBeTruthy();
  });

  it("should handle non-existent email gracefully", async () => {
    const result = await requestPasswordReset(
      "nonexistent@example.com",
      "https://example.com"
    );
    // Should return true for security (don't reveal if email exists)
    expect(result).toBe(true);
  });
});
