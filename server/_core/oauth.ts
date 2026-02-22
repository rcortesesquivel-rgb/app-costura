import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import type { Express, Request, Response } from "express";
import { getUserByOpenId, upsertUser } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function validatePhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return true;
  const cleaned = phoneNumber.replace(/\D/g, "");
  return cleaned.length >= 8 && cleaned.length <= 15;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function syncUser(userInfo: {
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  platform?: string | null;
  telefono?: string | null;
}) {
  if (!userInfo.openId) {
    throw new Error("openId missing from user info");
  }

  const lastSignedIn = new Date();
  // Only include name in upsert if it was explicitly provided (not undefined)
  // This prevents overwriting existing name with null on signin
  const upsertData: any = {
    openId: userInfo.openId,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn,
  };
  if (userInfo.name !== undefined) {
    upsertData.name = userInfo.name || null;
  }
  if (userInfo.telefono !== undefined) {
    upsertData.telefono = userInfo.telefono || null;
  }
  await upsertUser(upsertData);
  const saved = await getUserByOpenId(userInfo.openId);
  return (
    saved ?? {
      openId: userInfo.openId,
      name: userInfo.name,
      email: userInfo.email,
      loginMethod: userInfo.loginMethod ?? null,
      lastSignedIn,
    }
  );
}

function buildUserResponse(
  user:
    | Awaited<ReturnType<typeof getUserByOpenId>>
    | {
        openId: string;
        name?: string | null;
        email?: string | null;
        loginMethod?: string | null;
        lastSignedIn?: Date | null;
        role?: string | null;
        isActive?: string | null;
      },
) {
  return {
    id: (user as any)?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    role: (user as any)?.role ?? "user",
    isActive: (user as any)?.isActive ?? "active",
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? new Date()).toISOString(),
  };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to the frontend URL (Expo web on port 8081)
      // Cookie is set with parent domain so it works across both 3000 and 8081 subdomains
      const frontendUrl =
        process.env.EXPO_WEB_PREVIEW_URL ||
        process.env.EXPO_PACKAGER_PROXY_URL ||
        "http://localhost:8081";
      res.redirect(302, frontendUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  app.get("/api/oauth/mobile", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);

      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(user),
      });
    } catch (error) {
      console.error("[OAuth] Mobile exchange failed", error);
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // Get current authenticated user - works with both cookie (web) and Bearer token (mobile)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/me failed:", error);
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });

  // Establish session cookie from Bearer token
  // Used by iframe preview: frontend receives token via postMessage, then calls this endpoint
  // to get a proper Set-Cookie response from the backend (3000-xxx domain)
  app.post("/api/auth/session", async (req: Request, res: Response) => {
    try {
      // Authenticate using Bearer token from Authorization header
      const user = await sdk.authenticateRequest(req);

      // Get the token from the Authorization header to set as cookie
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }
      const token = authHeader.slice("Bearer ".length).trim();

      // Set cookie for this domain (3000-xxx)
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Sign up with email and password
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name, telefono } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: "email, password, and name are required" });
        return;
      }

      // Validar teléfono si se proporciona
      if (telefono && !validatePhoneNumber(telefono)) {
        res.status(400).json({ error: "Invalid phone number format" });
        return;
      }

      // Use email as openId for email/password authentication
      const openId = `email:${email}`;

      // Create or update user in database
      await syncUser({
        openId,
        email,
        name,
        telefono,
        loginMethod: "email",
      });

      // Read the REAL user from database to get id, role, isActive
      const savedUser = await getUserByOpenId(openId);
      const userResponse = savedUser || { openId, email, name, loginMethod: "email" };

      // Create session token and set cookie for authentication
      const sessionToken = await sdk.createSessionToken(openId, { name: name || undefined });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: buildUserResponse(userResponse) });
    } catch (error) {
      console.error("[Auth] /api/auth/signup failed:", error);
      res.status(500).json({ error: "Sign up failed" });
    }
  });

  // Sign in with email and password
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      // Use email as openId for email/password authentication
      const openId = `email:${email}`;

      // Update lastSignedIn only (don't overwrite name/role with null)
      await syncUser({
        openId,
        email,
        loginMethod: "email",
      });

      // Read the REAL user from database to get id, name, role, isActive
      const savedUser = await getUserByOpenId(openId);

      if (!savedUser) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      // Check if account is inactive
      if (savedUser.isActive === "inactive") {
        res.status(403).json({ error: "ACCOUNT_INACTIVE" });
        return;
      }

      console.log(`[Auth] signin success: ${email}, role=${savedUser.role}, id=${savedUser.id}`);

      // Create session token and set cookie for authentication
      const sessionToken = await sdk.createSessionToken(savedUser.openId, { name: savedUser.name || undefined });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: buildUserResponse(savedUser) });
    } catch (error) {
      console.error("[Auth] /api/auth/signin failed:", error);
      res.status(500).json({ error: "Sign in failed" });
    }
  });
}
