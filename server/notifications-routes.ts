import { z } from "zod";
import { router } from "./_core/trpc";
import { publicProcedure } from "./_core/trpc";
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

export const notificationsRouter = router({
  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        auth: z.string(),
        p256dh: z.string(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      await notificationsDb.savePushSubscription(
        ctx.user.id,
        input,
        ctx.req?.headers["user-agent"] as string | undefined
      );
      return { success: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      await notificationsDb.removePushSubscription(ctx.user.id, input.endpoint);
      return { success: true };
    }),

  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    return notificationsDb.getNotifications(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await notificationsDb.markNotificationAsRead(input.id);
      return { success: true };
    }),

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    const prefs = await notificationsDb.getNotificationPreferences(ctx.user.id);
    if (!prefs) {
      await notificationsDb.createNotificationPreferences(ctx.user.id);
      return notificationsDb.getNotificationPreferences(ctx.user.id);
    }
    return prefs;
  }),

  updatePreferences: protectedProcedure
    .input(z.object({
      readyForDelivery: z.number().optional(),
      pendingPayment: z.number().optional(),
      newClient: z.number().optional(),
      systemUpdates: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      await notificationsDb.updateNotificationPreferences(ctx.user.id, input);
      return { success: true };
    }),
});
