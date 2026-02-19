import { z } from "zod";
import { notificationsRouter } from "./notifications-routes";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as adminDb from "./admin-db";
import * as superAdminDb from "./superadmin-db";
import * as notificationsDb from "./notifications-db";

// Procedimiento protegido que requiere autenticación
const protectedProcedure = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.id) {
    throw new Error("Unauthorized: User not authenticated");
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: user,
    },
  });
});

// Procedimiento protegido solo para administradores
const adminProcedure = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.id || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: user,
    },
  });
});

// Procedimiento protegido solo para Super Administrador
const superAdminProcedure = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.email || !superAdminDb.isSuperAdmin(user.email)) {
    throw new Error("Unauthorized: Super admin access required");
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: user,
    },
  });
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CLIENTES ============
  clientes: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getAllClientes(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input, ctx }) => {
        return db.getClienteById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        nombreCompleto: z.string().min(1).max(255),
        telefono: z.string().max(20).optional(),
        codigoPais: z.string().max(5).optional(),
        whatsapp: z.string().max(20).optional(),
        direccion: z.string().optional(),
        redesSociales: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createCliente({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nombreCompleto: z.string().min(1).max(255).optional(),
          telefono: z.string().max(20).optional(),
          codigoPais: z.string().max(5).optional(),
          whatsapp: z.string().max(20).optional(),
          direccion: z.string().optional(),
          redesSociales: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateCliente(input.id, ctx.user.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteCliente(input.id, ctx.user.id);
        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input, ctx }) => {
        return db.searchClientes(input.query, ctx.user.id);
      }),
  }),

  // ============ MEDIDAS ============
  medidas: router({
    getByClienteId: protectedProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(({ input, ctx }) => {
        return db.getMedidasByClienteId(input.clienteId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clienteId: z.number(),
        cuello: z.string().max(10).optional(),
        hombros: z.string().max(10).optional(),
        pecho: z.string().max(10).optional(),
        cintura: z.string().max(10).optional(),
        cadera: z.string().max(10).optional(),
        largoManga: z.string().max(10).optional(),
        largoEspalda: z.string().max(10).optional(),
        largoPantalon: z.string().max(10).optional(),
        entrepierna: z.string().max(10).optional(),
        contornoBrazo: z.string().max(10).optional(),
        anchoPecho: z.string().max(10).optional(),
        anchoEspalda: z.string().max(10).optional(),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createMedidas({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          cuello: z.string().max(10).optional(),
          hombros: z.string().max(10).optional(),
          pecho: z.string().max(10).optional(),
          cintura: z.string().max(10).optional(),
          cadera: z.string().max(10).optional(),
          largoManga: z.string().max(10).optional(),
          largoEspalda: z.string().max(10).optional(),
          largoPantalon: z.string().max(10).optional(),
          entrepierna: z.string().max(10).optional(),
          contornoBrazo: z.string().max(10).optional(),
          anchoPecho: z.string().max(10).optional(),
          anchoEspalda: z.string().max(10).optional(),
          notas: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateMedidas(input.id, ctx.user.id, input.data);
        return { success: true };
      }),
  }),

  // ============ TRABAJOS ============
  trabajos: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getAllTrabajos(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input, ctx }) => {
        return db.getTrabajoById(input.id, ctx.user.id);
      }),

    getByClienteId: protectedProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(({ input, ctx }) => {
        return db.getTrabajosByClienteId(input.clienteId, ctx.user.id);
      }),

    getVencenHoy: protectedProcedure.query(({ ctx }) => {
      return db.getTrabajosVencenHoy(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        clienteId: z.number(),
        descripcion: z.string().min(1),
        precioBase: z.string(),
        abonoInicial: z.string().optional(),
        impuestos: z.string().optional(),
        varios: z.string().optional(),
        categoria: z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
        urgencia: z.enum(["baja", "media", "alta"]).optional(),
        fechaEntrega: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createTrabajo({
          ...input,
          userId: ctx.user.id,
          estado: "en_espera",
        });
        return { id };
      }),

    updateEstado: protectedProcedure
      .input(z.object({
        id: z.number(),
        estadoAnterior: z.string().optional(),
        estadoNuevo: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateTrabajo(input.id, ctx.user.id, {
          estado: input.estadoNuevo as any,
        });

        if (input.estadoAnterior) {
          await db.createHistorialEstado({
            userId: ctx.user.id,
            trabajoId: input.id,
            estadoAnterior: input.estadoAnterior,
            estadoNuevo: input.estadoNuevo,
          });
        }

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          descripcion: z.string().min(1).optional(),
          precioBase: z.string().optional(),
          abonoInicial: z.string().optional(),
          impuestos: z.string().optional(),
          varios: z.string().optional(),
          categoria: z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
          urgencia: z.enum(["baja", "media", "alta"]).optional(),
          fechaEntrega: z.date().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateTrabajo(input.id, ctx.user.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteTrabajo(input.id, ctx.user.id);
        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({
        query: z.string().optional(),
        estado: z.string().optional(),
      }))
      .query(({ input, ctx }) => {
        return db.searchTrabajos({
          ...input,
          userId: ctx.user.id,
        });
      }),

    calcularTotal: protectedProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input, ctx }) => {
        return db.calcularTotalTrabajo(input.trabajoId, ctx.user.id);
      }),
  }),

  // ============ AGREGADOS ============
  agregados: router({
    getByTrabajoId: protectedProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input, ctx }) => {
        return db.getAgregadosByTrabajoId(input.trabajoId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        trabajoId: z.number(),
        concepto: z.string().min(1).max(255),
        precio: z.string(),
        cantidad: z.number().min(1).default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAgregado(input);
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteAgregado(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ IMÁGENES ============
  imagenes: router({
    getByTrabajoId: protectedProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input, ctx }) => {
        return db.getImagenesByTrabajoId(input.trabajoId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        trabajoId: z.number(),
        url: z.string(),
        tipo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createImagen({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteImagen(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ HISTORIAL ============
  historial: router({
    getByTrabajoId: protectedProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input, ctx }) => {
        return db.getHistorialByTrabajoId(input.trabajoId, ctx.user.id);
      }),
  }),

  // ============ ADMIN ============
  admin: router({
    // Usuarios
    users: router({
      list: adminProcedure.query(() => {
        return adminDb.getAllUsers();
      }),

      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => {
          return adminDb.getUserById(input.id);
        }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          isActive: z.enum(["active", "inactive"]),
        }))
        .mutation(async ({ input }) => {
          await adminDb.updateUserStatus(input.id, input.isActive);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await adminDb.deleteUser(input.id);
          return { success: true };
        }),
    }),

    // Estadísticas
    stats: router({
      overview: adminProcedure.query(() => {
        return adminDb.getAdminStats();
      }),

      totalTrabajos: adminProcedure.query(() => {
        return adminDb.getTotalTrabajos();
      }),

      trabajosByEstado: adminProcedure.query(() => {
        return adminDb.getTrabajosCountByEstado();
      }),

      trabajosByTipo: adminProcedure.query(() => {
        return adminDb.getTrabajosCountByTipo();
      }),
    }),
  }),

  // ============ SUPER ADMIN ============
  superAdmin: router({
    // Usuarios
    users: router({
      list: superAdminProcedure.query(() => {
        return superAdminDb.getAllUsersWithStats();
      }),

      search: superAdminProcedure
        .input(z.object({ query: z.string() }))
        .query(({ input }) => {
          return superAdminDb.searchUsers(input.query);
        }),

      updatePlan: superAdminProcedure
        .input(z.object({
          id: z.number(),
          plan: z.enum(["basic", "vip", "lifetime"]),
        }))
        .mutation(async ({ input }) => {
          await superAdminDb.updateUserPlan(input.id, input.plan);
          return { success: true };
        }),

      updateStatus: superAdminProcedure
        .input(z.object({
          id: z.number(),
          isActive: z.enum(["active", "inactive"]),
        }))
        .mutation(async ({ input }) => {
          await superAdminDb.updateUserStatus(input.id, input.isActive);
          return { success: true };
        }),
    }),

    // Métricas
    metrics: router({
      overview: superAdminProcedure.query(() => {
        return superAdminDb.getSuperAdminMetrics();
      }),
    }),

    // Validación de límites de audio
    audio: router({
      canRecord: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.user) return false;
        return superAdminDb.canUserRecordAudio(ctx.user.id);
      }),

      recordTranscription: protectedProcedure.mutation(async ({ ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        await superAdminDb.incrementAudioTranscriptionCount(ctx.user.id);
        return { success: true };
      }),
    }),

    // Notificaciones
    notifications: notificationsRouter,
  }),
});

export type AppRouter = typeof appRouter;
