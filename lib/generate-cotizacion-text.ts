/**
 * Genera una cotización en formato texto simple
 * Sin dependencias externas, compatible con React Native
 */

export interface CotizacionData {
  clienteName: string;
  clientePhone?: string;
  clienteEmail?: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  impuestos: number;
  varios: number;
  abonoInicial: number;
  fechaEntrega?: string;
  condicionesPago?: string;
  tallerName?: string;
}

export function generateCotizacionText(data: CotizacionData): string {
  const subtotal = data.precioUnitario * data.cantidad;
  const total = subtotal + data.impuestos + data.varios;
  const saldoPendiente = total - data.abonoInicial;

  const lines = [
    "═══════════════════════════════════════════",
    `${data.tallerName || "TALLER DE COSTURA"}`,
    "═══════════════════════════════════════════",
    "",
    "COTIZACIÓN",
    "",
    "─────────────────────────────────────────",
    "DATOS DEL CLIENTE",
    "─────────────────────────────────────────",
    `Nombre: ${data.clienteName}`,
    ...(data.clientePhone ? [`Teléfono: ${data.clientePhone}`] : []),
    ...(data.clienteEmail ? [`Email: ${data.clienteEmail}`] : []),
    "",
    "─────────────────────────────────────────",
    "DESCRIPCIÓN DEL TRABAJO",
    "─────────────────────────────────────────",
    data.descripcion,
    "",
    "─────────────────────────────────────────",
    "DETALLES",
    "─────────────────────────────────────────",
    `Precio Unitario:      ₡${data.precioUnitario.toFixed(2)}`,
    `Cantidad:             ${data.cantidad}`,
    `Subtotal:             ₡${subtotal.toFixed(2)}`,
    ...(data.impuestos > 0 ? [`Impuestos:            ₡${data.impuestos.toFixed(2)}`] : []),
    ...(data.varios > 0 ? [`Otros Gastos:         ₡${data.varios.toFixed(2)}`] : []),
    "",
    `TOTAL:                ₡${total.toFixed(2)}`,
    "",
    "─────────────────────────────────────────",
    "PAGOS",
    "─────────────────────────────────────────",
    `Abono Inicial:        ₡${data.abonoInicial.toFixed(2)}`,
    `Saldo Pendiente:      ₡${Math.max(0, saldoPendiente).toFixed(2)}`,
    "",
    ...(data.fechaEntrega ? [
      "─────────────────────────────────────────",
      "FECHA DE ENTREGA",
      "─────────────────────────────────────────",
      data.fechaEntrega,
      "",
    ] : []),
    ...(data.condicionesPago ? [
      "─────────────────────────────────────────",
      "CONDICIONES DE PAGO",
      "─────────────────────────────────────────",
      data.condicionesPago,
      "",
    ] : []),
    "═══════════════════════════════════════════",
    `Generado: ${new Date().toLocaleDateString("es-CR")} ${new Date().toLocaleTimeString("es-CR")}`,
    "═══════════════════════════════════════════",
  ];

  return lines.join("\n");
}
