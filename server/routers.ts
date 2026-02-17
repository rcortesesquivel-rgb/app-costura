import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

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
    list: publicProcedure.query(() => {
      return db.getAllClientes();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getClienteById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        nombreCompleto: z.string().min(1).max(255),
        telefono: z.string().max(20).optional(),
        direccion: z.string().optional(),
        redesSociales: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCliente(input);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nombreCompleto: z.string().min(1).max(255).optional(),
          telefono: z.string().max(20).optional(),
          direccion: z.string().optional(),
          redesSociales: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateCliente(input.id, input.data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCliente(input.id);
        return { success: true };
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => {
        return db.searchClientes(input.query);
      }),
  }),

  // ============ MEDIDAS ============
  medidas: router({
    getByClienteId: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(({ input }) => {
        return db.getMedidasByClienteId(input.clienteId);
      }),

    create: publicProcedure
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
      .mutation(async ({ input }) => {
        const id = await db.createMedidas(input);
        return { id };
      }),

    update: publicProcedure
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
      .mutation(async ({ input }) => {
        await db.updateMedidas(input.id, input.data);
        return { success: true };
      }),
  }),

  // ============ TRABAJOS ============
  trabajos: router({
    list: publicProcedure.query(() => {
      return db.getAllTrabajos();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getTrabajoById(input.id);
      }),

    getByClienteId: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(({ input }) => {
        return db.getTrabajosByClienteId(input.clienteId);
      }),

    getByEstado: publicProcedure
      .input(z.object({ estado: z.string() }))
      .query(({ input }) => {
        return db.getTrabajosByEstado(input.estado);
      }),

    getVencenHoy: publicProcedure.query(() => {
      return db.getTrabajosVencenHoy();
    }),

    create: publicProcedure
      .input(z.object({
        clienteId: z.number(),
        tipo: z.enum(["arreglo", "confeccion", "personalizacion"]),
        descripcion: z.string().min(1),
        precioBase: z.string(),
        abonoInicial: z.string().default("0"),
        tipoPrenda: z.string().max(100).optional(),
        nivelUrgencia: z.enum(["baja", "media", "alta"]).optional(),
        tipoTela: z.string().max(100).optional(),
        metrosRequeridos: z.string().max(10).optional(),
        fechaPrueba: z.date().optional(),
        tipoPersonalizacion: z.string().max(100).optional(),
        estado: z.enum(["en_espera", "cortando", "cosiendo", "listo", "entregado"]).default("en_espera"),
        fechaEntrega: z.date().optional(),
        notasVoz: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTrabajo(input);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          descripcion: z.string().min(1).optional(),
          precioBase: z.string().optional(),
          abonoInicial: z.string().optional(),
          tipoPrenda: z.string().max(100).optional(),
          nivelUrgencia: z.enum(["baja", "media", "alta"]).optional(),
          tipoTela: z.string().max(100).optional(),
          metrosRequeridos: z.string().max(10).optional(),
          fechaPrueba: z.date().optional(),
          tipoPersonalizacion: z.string().max(100).optional(),
          estado: z.enum(["en_espera", "cortando", "cosiendo", "listo", "entregado"]).optional(),
          fechaEntrega: z.date().optional(),
          fechaEntregado: z.date().optional(),
          notasVoz: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateTrabajo(input.id, input.data);
        return { success: true };
      }),

    updateEstado: publicProcedure
      .input(z.object({
        id: z.number(),
        estadoAnterior: z.string().optional(),
        estadoNuevo: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTrabajo(input.id, { estado: input.estadoNuevo as any });
        await db.createHistorialEstado({
          trabajoId: input.id,
          estadoAnterior: input.estadoAnterior,
          estadoNuevo: input.estadoNuevo,
        });
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTrabajo(input.id);
        return { success: true };
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        tipo: z.string().optional(),
        estado: z.string().optional(),
        clienteId: z.number().optional(),
      }))
      .query(({ input }) => {
        return db.searchTrabajos(input);
      }),

    calcularTotal: publicProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input }) => {
        return db.calcularTotalTrabajo(input.trabajoId);
      }),
  }),

  // ============ AGREGADOS ============
  agregados: router({
    getByTrabajoId: publicProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input }) => {
        return db.getAgregadosByTrabajoId(input.trabajoId);
      }),

    create: publicProcedure
      .input(z.object({
        trabajoId: z.number(),
        concepto: z.string().min(1).max(255),
        precio: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAgregado(input);
        return { id };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAgregado(input.id);
        return { success: true };
      }),
  }),

  // ============ IMÁGENES ============
  imagenes: router({
    getByTrabajoId: publicProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input }) => {
        return db.getImagenesByTrabajoId(input.trabajoId);
      }),

    create: publicProcedure
      .input(z.object({
        trabajoId: z.number(),
        url: z.string(),
        tipo: z.string().max(50).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createImagen(input);
        return { id };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteImagen(input.id);
        return { success: true };
      }),
  }),

  // ============ HISTORIAL ============
  historial: router({
    getByTrabajoId: publicProcedure
      .input(z.object({ trabajoId: z.number() }))
      .query(({ input }) => {
        return db.getHistorialByTrabajoId(input.trabajoId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
