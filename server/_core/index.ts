import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import webhookRoutes from "../webhooks";
import { setupReciboRoutes } from "../generate-recibo";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Request logging for debugging
  app.use((req, _res, next) => {
    console.log(`[http] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Endpoint temporal de seed para insertar admin en whitelist
  app.post("/api/seed-admin", async (req, res) => {
    const seedKey = req.body?.seedKey;
    if (seedKey !== "costura-seed-2026-init") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    try {
      const { getDb, emailsAutorizados } = await import("../db");
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }
      // Insert admin email into whitelist (sin expiresAt = acceso permanente)
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`INSERT INTO emailsAutorizados (email, nombre, plan, status, expiresAt, createdAt) VALUES ('rcortesesquivel@gmail.com', 'Administrador Principal', 'lifetime', 'pagado', NULL, NOW()) ON DUPLICATE KEY UPDATE plan = 'lifetime', status = 'pagado', nombre = 'Administrador Principal', expiresAt = NULL`);

      res.json({ success: true, message: "Admin email added to whitelist" });
    } catch (error: any) {
      // If duplicate, that's fine
      if (error?.message?.includes("Duplicate") || error?.code === "ER_DUP_ENTRY") {
        res.json({ success: true, message: "Admin email already exists in whitelist" });
      } else {
        console.error("[Seed] Error:", error);
        res.status(500).json({ error: error?.message || "Failed to seed admin" });
      }
    }
  });

  // Registrar rutas de webhooks
  app.use("/api/webhooks", webhookRoutes);
  
  // Registrar rutas de recibos
  setupReciboRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  
  server.listen(preferredPort, "0.0.0.0", () => {
    console.log(`[api] server listening on port ${preferredPort} on 0.0.0.0`);
  });
  
  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[api] Port ${preferredPort} is already in use. Kill the process and try again.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer().catch(console.error);
