import { getDb } from "./db";
import { passwordResets, users, emailsAutorizados } from "../drizzle/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Generar un token seguro para recuperación de contraseña
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Solicitar recuperación de contraseña
 * Verifica en users (registro) y emailsAutorizados (suscripción)
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  userStatus?: "not_found" | "trial_expired" | "active";
  token?: string;
  resetLink?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Base de datos no disponible" };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1) Buscar en users (tabla de registro/login)
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (userRows.length === 0) {
      // Email no está registrado en absoluto → Landing page
      return {
        success: false,
        message: "Email no registrado",
        userStatus: "not_found",
      };
    }

    // 2) Buscar en emailsAutorizados para verificar estado de suscripción
    const authRows = await db
      .select()
      .from(emailsAutorizados)
      .where(eq(emailsAutorizados.email, normalizedEmail))
      .limit(1);

    if (authRows.length > 0) {
      const auth = authRows[0];

      // Si es usuario de prueba, verificar si venció
      if (auth.status === "prueba" && auth.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(auth.expiresAt);
        if (expiresAt <= now) {
          return {
            success: false,
            message:
              "Tu período de prueba ha vencido. Activa tu membresía para continuar.",
            userStatus: "trial_expired",
          };
        }
      }
    }

    // 3) Usuario existe y está activo → generar token de recuperación
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.insert(passwordResets).values({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    const resetLink = `${
      process.env.APP_URL || "http://localhost:8081"
    }/auth/reset-password?token=${token}`;

    console.log(`[Password Reset] Requested for ${normalizedEmail}`);
    console.log(`[Password Reset] Token: ${token}`);
    console.log(`[Password Reset] Link: ${resetLink}`);

    return {
      success: true,
      message: "Email de recuperación enviado",
      userStatus: "active",
      token: process.env.NODE_ENV === "development" ? token : undefined,
      resetLink:
        process.env.NODE_ENV === "development" ? resetLink : undefined,
    };
  } catch (error) {
    console.error("[Password Reset] Error requesting reset:", error);
    return { success: false, message: "Error al procesar la solicitud" };
  }
}

/**
 * Validar token de recuperación y obtener email
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  message: string;
  userStatus?: "trial_expired" | "active";
}> {
  const db = await getDb();
  if (!db) {
    return { valid: false, message: "Base de datos no disponible" };
  }

  try {
    // Buscar token válido, no expirado y no usado
    const resetRows = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          gt(passwordResets.expiresAt, new Date()),
          isNull(passwordResets.usedAt)
        )
      )
      .limit(1);

    if (resetRows.length === 0) {
      return { valid: false, message: "Token inválido o expirado" };
    }

    const resetEmail = resetRows[0].email;

    // Verificar estado de suscripción en emailsAutorizados
    const authRows = await db
      .select()
      .from(emailsAutorizados)
      .where(eq(emailsAutorizados.email, resetEmail))
      .limit(1);

    if (authRows.length > 0) {
      const auth = authRows[0];
      if (auth.status === "prueba" && auth.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(auth.expiresAt);
        if (expiresAt <= now) {
          return {
            valid: false,
            email: resetEmail,
            message:
              "Tu período de prueba ha vencido. Activa tu membresía para continuar.",
            userStatus: "trial_expired",
          };
        }
      }
    }

    return {
      valid: true,
      email: resetEmail,
      message: "Token válido",
      userStatus: "active",
    };
  } catch (error) {
    console.error("[Password Reset] Error validating token:", error);
    return { valid: false, message: "Token inválido o expirado" };
  }
}

/**
 * Resetear contraseña usando token
 * Marca el token como usado
 */
export async function resetPassword(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Base de datos no disponible" };
  }

  try {
    const validation = await validateResetToken(token);
    if (!validation.valid || !validation.email) {
      return { success: false, message: validation.message };
    }

    // Marcar token como usado
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.token, token));

    console.log(
      `[Password Reset] Password reset completed for ${validation.email}`
    );

    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (error) {
    console.error("[Password Reset] Error resetting password:", error);
    return { success: false, message: "Error al actualizar contraseña" };
  }
}
