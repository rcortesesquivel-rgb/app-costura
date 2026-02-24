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
import { storagePut } from "./storage";

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
        precioUnitario: z.string(),
        cantidad: z.number().int().min(1).default(1),
        abonoInicial: z.string().optional(),
        impuestos: z.string().optional(),
        varios: z.string().optional(),
        categoria: z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
        urgencia: z.enum(["baja", "media", "alta"]).optional(),
        fechaEntrega: z.date().optional(),
        attachments: z.array(z.object({ uri: z.string(), name: z.string(), type: z.enum(["image", "document"]) })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createTrabajo({
          clienteId: input.clienteId,
          descripcion: input.descripcion,
          precioUnitario: input.precioUnitario,
          cantidad: input.cantidad ?? 1,
          abonoInicial: input.abonoInicial ?? "0.00",
          impuestos: input.impuestos ?? "0.00",
          varios: input.varios ?? "0.00",
          categoria: input.categoria ?? "otros",
          urgencia: input.urgencia,
          fechaEntrega: input.fechaEntrega,
          userId: ctx.user.id,
          estado: "recibido",
        });

        // Procesar adjuntos si existen
        if (input.attachments && input.attachments.length > 0) {
          for (const attachment of input.attachments) {
            try {
              await db.createImagen({
                userId: ctx.user.id,
                trabajoId: id,
                url: attachment.uri,
                tipo: attachment.type,
              });
            } catch (error) {
              console.error(`Error guardando imagen ${attachment.name}:`, error);
            }
          }
        }

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

    togglePagado: protectedProcedure
      .input(z.object({ id: z.number(), pagado: z.number().min(0).max(1) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateTrabajo(input.id, ctx.user.id, { pagado: input.pagado } as any);
        return { success: true };
      }),

    dividir: protectedProcedure
      .input(z.object({
        id: z.number(),
        cantidadSeparar: z.number().int().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const trabajo = await db.getTrabajoById(input.id, ctx.user.id);
        if (!trabajo) throw new Error("Trabajo no encontrado");
        const cantidadActual = trabajo.cantidad ?? 1;
        if (input.cantidadSeparar >= cantidadActual) throw new Error("La cantidad a separar debe ser menor a la actual");
        // Restar del original
        await db.updateTrabajo(input.id, ctx.user.id, { cantidad: cantidadActual - input.cantidadSeparar } as any);
        // Crear nuevo con cantidad separada en estado recibido
        const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
        const nuevoId = await db.createTrabajo({
          userId: ctx.user.id,
          clienteId: trabajo.clienteId,
          descripcion: trabajo.descripcion || "",
          precioUnitario: precioUnitario.toFixed(2),
          cantidad: input.cantidadSeparar,
          abonoInicial: "0.00",
          impuestos: "0.00",
          varios: "0.00",
          categoria: trabajo.categoria,
          urgencia: trabajo.urgencia,
          estado: "recibido",
          fechaEntrega: trabajo.fechaEntrega,
        });
        // Ajustar precio del original
        // No es necesario ajustar precio del original, solo la cantidad
        return { nuevoId, cantidadOriginal: cantidadActual - input.cantidadSeparar };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          descripcion: z.string().min(1).optional(),
          precioUnitario: z.string().optional(),
          cantidad: z.number().int().min(1).optional(),
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

    misEstadisticas: protectedProcedure.query(async ({ ctx }) => {
      return db.getMisEstadisticas(ctx.user.id);
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

    addToTrabajo: protectedProcedure
      .input(z.object({
        trabajoId: z.number(),
        attachments: z.array(z.object({
          uri: z.string(),
          name: z.string(),
          type: z.enum(["image", "document"]),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const ids = [];
        for (const attachment of input.attachments) {
          const id = await db.createImagen({
            userId: ctx.user.id,
            trabajoId: input.trabajoId,
            url: attachment.uri,
            tipo: attachment.type,
          });
          ids.push(id);
        }
        return { ids };
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

    // Audios
    audios: router({
      getByTrabajoId: protectedProcedure
        .input(z.object({ trabajoId: z.number() }))
        .query(({ input, ctx }) => db.getAudiosByTrabajoId(input.trabajoId, ctx.user.id)),

      upload: protectedProcedure
        .input(z.object({
          trabajoId: z.number(),
          base64: z.string(),
          duracion: z.number().int().min(0).max(30),
          descripcion: z.string().optional(),
          mimeType: z.string().default("audio/webm"),
        }))
        .mutation(async ({ input, ctx }) => {
          // Subir audio a S3
          const buffer = Buffer.from(input.base64, "base64");
          const ext = input.mimeType.includes("webm") ? "webm" : "mp3";
          const key = `audios/${ctx.user.id}/${input.trabajoId}/${Date.now()}.${ext}`;
          const { url } = await storagePut(key, buffer, input.mimeType);
          // Guardar en DB (con validación de límite 5)
          const audioId = await db.createAudio({
            userId: ctx.user.id,
            trabajoId: input.trabajoId,
            url,
            duracion: input.duracion,
            descripcion: input.descripcion,
          });
          return { id: audioId, url };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.deleteAudio(input.id, ctx.user.id);
          return { success: true };
        }),
     }),
    // Whitelist de Emails (Super Admin)
    whitelist: router({
      list: superAdminProcedure
        .input(z.object({ search: z.string().optional(), status: z.enum(["prueba", "pagado"]).optional() }).optional())
        .query(async ({ input }) => {
          const db_conn = await db.getDb();
          if (!db_conn) throw new Error("Database not available");
          
          let query = db_conn.select().from(db.emailsAutorizados);
          
          if (input?.search) {
            query = query.where(
              db.or(
                db.like(db.emailsAutorizados.email, `%${input.search}%`),
                db.like(db.emailsAutorizados.nombre, `%${input.search}%`)
              )
            );
          }
          
          if (input?.status) {
            query = query.where(db.eq(db.emailsAutorizados.status, input.status));
          }
          
          return query.orderBy(db.desc(db.emailsAutorizados.createdAt));
        }),
      create: superAdminProcedure
        .input(z.object({
          email: z.string().email(),
          nombre: z.string().min(1),
          plan: z.enum(["basic", "vip", "lifetime"]),
          status: z.enum(["prueba", "pagado"]),
          diasExpiracion: z.number().int().min(1).default(2),
        }))
        .mutation(async ({ input }) => {
          const db_conn = await db.getDb();
          if (!db_conn) throw new Error("Database not available");
          
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + input.diasExpiracion);
          
          const result = await db_conn.insert(db.emailsAutorizados).values({
            email: input.email,
            nombre: input.nombre,
            plan: input.plan,
            status: input.status,
            expiresAt,
          });
          
          return { id: result[0].insertId, email: input.email };
        }),
      update: superAdminProcedure
        .input(z.object({
          email: z.string().email(),
          nombre: z.string().min(1).optional(),
          plan: z.enum(["basic", "vip", "lifetime"]).optional(),
          status: z.enum(["prueba", "pagado"]).optional(),
          diasExpiracion: z.number().int().min(1).optional(),
        }))
        .mutation(async ({ input }) => {
          const db_conn = await db.getDb();
          if (!db_conn) throw new Error("Database not available");
          
          const updateData: any = {};
          if (input.nombre) updateData.nombre = input.nombre;
          if (input.plan) updateData.plan = input.plan;
          if (input.status) updateData.status = input.status;
          
          if (input.diasExpiracion) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + input.diasExpiracion);
            updateData.expiresAt = expiresAt;
          }
          
          await db_conn.update(db.emailsAutorizados).set(updateData).where(db.eq(db.emailsAutorizados.email, input.email));
          return { success: true };
        }),
      delete: superAdminProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ input }) => {
          const db_conn = await db.getDb();
          if (!db_conn) throw new Error("Database not available");
          
          await db_conn.delete(db.emailsAutorizados).where(db.eq(db.emailsAutorizados.email, input.email));
          return { success: true };
        }),
    }),
  }),

  // Buzón de sugerencias
  sugerencias: router({
    enviar: protectedProcedure
      .input(z.object({
        asunto: z.string().min(1).max(500),
        mensaje: z.string().min(1).max(5000),
      }))
      .mutation(async ({ ctx, input }) => {
        const db_conn = await db.getDb();
        if (!db_conn) throw new Error("Database not available");

        // Guardar en base de datos
        await db_conn.insert(db.sugerencias).values({
          userId: ctx.user.id,
          nombreUsuario: ctx.user.name || "Sin nombre",
          emailUsuario: ctx.user.email || "Sin email",
          asunto: input.asunto,
          mensaje: input.mensaje,
        });

        // Notificar al dueño
        const { notifyOwner } = await import("./_core/notification");
        try {
          await notifyOwner({
            title: `Nueva sugerencia: ${input.asunto}`,
            content: `De: ${ctx.user.name || ctx.user.email || "Usuario"}\nEmail: ${ctx.user.email || "N/A"}\n\n${input.mensaje}`,
          });
        } catch (e) {
          console.warn("[Sugerencias] No se pudo notificar al dueño:", e);
        }

        return { success: true };
      }),

    // Listar sugerencias (solo admin)
    listar: superAdminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const db_conn = await db.getDb();
        if (!db_conn) return [];
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        return db_conn.select().from(db.sugerencias).orderBy(db.desc(db.sugerencias.createdAt)).limit(limit).offset(offset);
      }),
  }),
});
export type AppRouter = typeof appRouter;
