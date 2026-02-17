import { Router } from "express";
import { getDb } from "./db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const forgotPasswordRouter = Router();

/**
 * POST /api/auth/forgot-password
 * Envía un enlace de recuperación de contraseña al email del usuario
 */
forgotPasswordRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email es requerido" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Base de datos no disponible" });
    }

    // Buscar usuario por email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({
        success: true,
        message: "Si el email existe en nuestro sistema, recibirás un enlace de recuperación",
      });
    }

    const userData = user[0];

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, userData.id));

    // En producción, aquí se enviaría un email real
    // Por ahora, solo registramos que se solicitó el reset
    console.log(`[Auth] Reset password requested for ${email}`);
    console.log(`[Auth] Reset token: ${resetToken}`);
    console.log(`[Auth] Reset link: ${process.env.APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: "Se envió un enlace de recuperación a tu email",
      // En desarrollo, devolvemos el token para pruebas
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    });
  } catch (error) {
    console.error("[Auth] Error in forgot-password:", error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

/**
 * POST /api/auth/reset-password
 * Valida el token y permite al usuario establecer una nueva contraseña
 */
forgotPasswordRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Base de datos no disponible" });
    }

    // Buscar usuario con token válido
    const user = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (user.length === 0) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    const userData = user[0];

    // Verificar que el token no haya expirado
    if (!userData.resetTokenExpiry || new Date() > userData.resetTokenExpiry) {
      return res.status(400).json({ error: "El enlace de recuperación ha expirado" });
    }

    // Actualizar token de reset (en producción, también actualizar contraseña hasheada)
    // TODO: Implementar hashing de contraseña en producción
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, userData.id));

    console.log(`[Auth] Password reset successful for ${userData.email}`);

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("[Auth] Error in reset-password:", error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

/**
 * Genera un token aleatorio para recuperación de contraseña
 */
function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
