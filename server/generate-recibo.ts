import type { Express } from "express";
import { getDb } from "./db";
import { trabajos, clientes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₡0.00";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function setupReciboRoutes(app: Express) {
  app.get("/api/recibo/:trabajoId", async (req, res) => {
    try {
      const trabajoId = parseInt(req.params.trabajoId);
      if (isNaN(trabajoId)) { res.status(400).json({ error: "ID inválido" }); return; }

      const db = await getDb();
      if (!db) { res.status(500).json({ error: "Error de BD" }); return; }

      const [trabajo] = await db.select().from(trabajos).where(eq(trabajos.id, trabajoId));
      if (!trabajo) { res.status(404).json({ error: "Trabajo no encontrado" }); return; }

      const [cliente] = await db.select().from(clientes).where(eq(clientes.id, trabajo.clienteId));
      if (!cliente) { res.status(404).json({ error: "Cliente no encontrado" }); return; }

      const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
      const impuestosVal = parseFloat(trabajo.impuestos || "0");
      const variosVal = parseFloat(trabajo.varios || "0");
      const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
      const cantidad = trabajo.cantidad ?? 1;
      const subtotal = precioUnitario * cantidad;
      const granTotal = subtotal + impuestosVal + variosVal;
      const saldo = granTotal - abonoInicial;
      const folio = `TC-${String(trabajo.id).padStart(5, "0")}`;
      const fecha = new Date().toLocaleDateString("es-CR", { year: "numeric", month: "long", day: "numeric" });
      const categoriaLabels: Record<string, string> = { arreglo: "Arreglo", confeccion: "Confección", bordado: "Bordado", sublimado: "Sublimado", otros: "Otros" };
      const estadoLabels: Record<string, string> = { recibido: "Recibido", cortando: "Cortando", cosiendo: "Cosiendo", bordado_personalizado: "Bordado/Personalizado", listo: "Listo", entregado: "Entregado", en_espera: "En espera" };

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo ${folio}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; background: #f8f9fa; -webkit-user-select: none; user-select: none; }
    .recibo { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #0a7ea4; border-radius: 12px; padding: 24px; }
    .header { text-align: center; border-bottom: 3px solid #0a7ea4; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { color: #0a7ea4; font-size: 26px; margin-bottom: 4px; }
    .header .folio { font-size: 18px; font-weight: bold; color: #333; }
    .header .fecha { color: #687076; font-size: 13px; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .section h2 { color: #0a7ea4; font-size: 15px; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #E5E7EB; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #687076; font-size: 13px; }
    .value { color: #11181C; font-size: 13px; }
    .totales { margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
    .total-row.final { font-size: 18px; font-weight: bold; color: #0a7ea4; border-top: 2px solid #0a7ea4; padding-top: 10px; margin-top: 6px; }
    .saldo { color: #EF4444; }
    .footer { margin-top: 24px; text-align: center; color: #687076; font-size: 11px; border-top: 1px solid #E5E7EB; padding-top: 14px; }
    .no-print { margin: 20px auto; max-width: 600px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; margin: 4px; }
    .btn-wa { background: #25D366; color: #fff; }
    .btn-print { background: #0a7ea4; color: #fff; }
    @media print { .no-print { display: none; } body { padding: 10px; background: #fff; } .recibo { border: none; } }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <h1>Taller de Costura</h1>
      <div class="folio">Folio: ${folio}</div>
      <div class="fecha">${fecha}</div>
    </div>
    <div class="section">
      <h2>Cliente</h2>
      <div class="row"><span class="label">Nombre:</span><span class="value">${cliente.nombreCompleto}</span></div>
      <div class="row"><span class="label">Teléfono:</span><span class="value">${cliente.telefono || "N/A"}</span></div>
    </div>
    <div class="section">
      <h2>Trabajo</h2>
      <div class="row"><span class="label">Categoría:</span><span class="value">${categoriaLabels[trabajo.categoria || "otros"] || "Otros"}</span></div>
      <div class="row"><span class="label">Cantidad:</span><span class="value">${cantidad}</span></div>
      <div class="row"><span class="label">Descripción:</span><span class="value">${trabajo.descripcion || "Sin descripción"}</span></div>
      <div class="row"><span class="label">Estado:</span><span class="value">${estadoLabels[trabajo.estado] || trabajo.estado}</span></div>
      ${trabajo.fechaEntrega ? `<div class="row"><span class="label">Fecha entrega:</span><span class="value">${new Date(trabajo.fechaEntrega).toLocaleDateString("es-CR")}</span></div>` : ""}
    </div>
    <div class="totales">
      <div class="total-row"><span>Subtotal (unitario × cantidad):</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="total-row"><span>Impuestos:</span><span>${formatCurrency(impuestosVal)}</span></div>
      <div class="total-row"><span>Varios:</span><span>${formatCurrency(variosVal)}</span></div>
      <div class="total-row final"><span>Gran Total:</span><span>${formatCurrency(granTotal)}</span></div>
      <div class="total-row"><span>Abono inicial:</span><span>-${formatCurrency(abonoInicial)}</span></div>
      <div class="total-row final"><span class="${saldo > 0 ? "saldo" : ""}">Saldo pendiente:</span><span class="${saldo > 0 ? "saldo" : ""}">${formatCurrency(saldo)}</span></div>
    </div>
    <div class="footer">
      <p>Gracias por confiar en nuestro taller</p>
      <p>Este recibo es un comprobante de los servicios acordados</p>
    </div>
  </div>
  <div class="no-print">
    <button class="btn btn-print" onclick="window.print()">Imprimir</button>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("[Recibo] Error:", error);
      res.status(500).json({ error: "Error generando recibo" });
    }
  });
}
