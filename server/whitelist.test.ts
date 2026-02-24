import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Whitelist Management", () => {
  let testEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Ensure database is available
    const conn = await db.getDb();
    if (!conn) {
      throw new Error("Database not available");
    }
  });

  afterAll(async () => {
    // Cleanup: delete test email
    const conn = await db.getDb();
    if (conn) {
      try {
        await conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, testEmail));
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it("should create a whitelist entry with diasExpiracion", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    const result = await conn.insert(db.emailsAutorizados).values({
      email: testEmail,
      nombre: "Test User",
      plan: "basic",
      status: "prueba",
      expiresAt,
    });

    expect(result).toBeDefined();
    expect(result[0].insertId).toBeGreaterThan(0);
  });

  it("should list whitelist entries", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    const entries = await conn.select().from(db.emailsAutorizados);

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);

    // Find our test entry
    const testEntry = entries.find((e: any) => e.email === testEmail);
    expect(testEntry).toBeDefined();
    expect(testEntry?.nombre).toBe("Test User");
    expect(testEntry?.plan).toBe("basic");
    expect(testEntry?.status).toBe("prueba");
  });

  it("should update a whitelist entry", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await conn.update(db.emailsAutorizados).set({
      nombre: "Updated User",
      plan: "vip",
      status: "pagado",
      expiresAt: newExpiresAt,
    }).where(db.eq(db.emailsAutorizados.email, testEmail));

    const updated = await conn.select().from(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, testEmail));

    expect(updated.length).toBe(1);
    expect(updated[0].nombre).toBe("Updated User");
    expect(updated[0].plan).toBe("vip");
    expect(updated[0].status).toBe("pagado");
  });

  it("should delete a whitelist entry", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    await conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, testEmail));

    const deleted = await conn.select().from(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, testEmail));

    expect(deleted.length).toBe(0);
  });

  it("should filter whitelist by status", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    // Create test entries with different statuses
    const paidEmail = `paid-${Date.now()}@example.com`;
    const trialEmail = `trial-${Date.now()}@example.com`;

    const paidExpires = new Date();
    paidExpires.setDate(paidExpires.getDate() + 30);

    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + 2);

    await conn.insert(db.emailsAutorizados).values({
      email: paidEmail,
      nombre: "Paid User",
      plan: "vip",
      status: "pagado",
      expiresAt: paidExpires,
    });

    await conn.insert(db.emailsAutorizados).values({
      email: trialEmail,
      nombre: "Trial User",
      plan: "basic",
      status: "prueba",
      expiresAt: trialExpires,
    });

    // Query by status
    const paidEntries = await conn.select().from(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.status, "pagado"));
    const trialEntries = await conn.select().from(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.status, "prueba"));

    expect(paidEntries.some((e: any) => e.email === paidEmail)).toBe(true);
    expect(trialEntries.some((e: any) => e.email === trialEmail)).toBe(true);

    // Cleanup
    await conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, paidEmail));
    await conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, trialEmail));
  });

  it("should search whitelist by email or name", async () => {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database not available");

    const searchEmail = `search-${Date.now()}@example.com`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    await conn.insert(db.emailsAutorizados).values({
      email: searchEmail,
      nombre: "Searchable User",
      plan: "basic",
      status: "prueba",
      expiresAt,
    });

    // Search by email
    const byEmail = await conn.select().from(db.emailsAutorizados).where(
      db.like(db.emailsAutorizados.email, `%${searchEmail.split("@")[0]}%`)
    );

    expect(byEmail.some((e: any) => e.email === searchEmail)).toBe(true);

    // Search by name
    const byName = await conn.select().from(db.emailsAutorizados).where(
      db.like(db.emailsAutorizados.nombre, "%Searchable%")
    );

    expect(byName.some((e: any) => e.email === searchEmail)).toBe(true);

    // Cleanup
    await conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, searchEmail));
  });
});
