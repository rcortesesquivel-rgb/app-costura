import { getDb } from "./db";
import { trabajos, clientes } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export async function generateTrabajosPDF(userId: number): Promise<Buffer> {
  // Obtener todos los trabajos del usuario
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userTrabajos = await db
    .select({
      id: trabajos.id,
      descripcion: trabajos.descripcion,
      estado: trabajos.estado,
      categoria: trabajos.categoria,
      cantidad: trabajos.cantidad,
      precioUnitario: trabajos.precioUnitario,
      impuestos: trabajos.impuestos,
      varios: trabajos.varios,
      pagado: trabajos.pagado,
      clienteName: (clientes as any).nombre,
      clientePhone: clientes.telefono,
      fechaEntrega: trabajos.fechaEntrega,
      createdAt: trabajos.createdAt,
    })
    .from(trabajos)
    .innerJoin(clientes, eq(trabajos.clienteId, clientes.id))
    .where(eq(trabajos.userId, userId))
    .orderBy(trabajos.createdAt);

  // Estadísticas
  const totalTrabajos = userTrabajos.length;
  const trabajosEntregados = userTrabajos.filter((t: any) => t.estado === "entregado").length;
  const trabajosPagados = userTrabajos.filter((t: any) => t.pagado === 1).length;
  const totalIngresos = userTrabajos
    .filter((t: any) => t.pagado === 1)
    .reduce((sum: number, t: any) => {
      const unitario = parseFloat(t.precioUnitario || "0");
      const impuestos = parseFloat(t.impuestos || "0");
      const varios = parseFloat(t.varios || "0");
      return sum + unitario * t.cantidad + impuestos + varios;
    }, 0);

  // Generar HTML
  const hoy = new Date().toLocaleDateString("es-CR");
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #000; margin-bottom: 10px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        .stats { margin-bottom: 30px; }
        .stat-row { margin: 8px 0; font-size: 14px; }
        .stat-label { font-weight: bold; }
        .stat-value { color: #008000; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #000; font-weight: bold; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Resumen de Trabajos</h1>
      <div class="meta">Generado: ${hoy}</div>
      
      <div class="stats">
        <div class="stat-row">Total de trabajos: <span class="stat-label">${totalTrabajos}</span></div>
        <div class="stat-row">Trabajos entregados: <span class="stat-label">${trabajosEntregados}</span></div>
        <div class="stat-row">Trabajos pagados: <span class="stat-label">${trabajosPagados}</span></div>
        <div class="stat-row">Ingresos totales: <span class="stat-value">₡${totalIngresos.toFixed(2)}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Cantidad</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  userTrabajos.slice(0, 50).forEach((trabajo: any) => {
    const unitario = parseFloat(trabajo.precioUnitario || "0");
    const impuestos = parseFloat(trabajo.impuestos || "0");
    const varios = parseFloat(trabajo.varios || "0");
    const total = unitario * trabajo.cantidad + impuestos + varios;

    html += `
      <tr>
        <td>${trabajo.id}</td>
        <td>${trabajo.clienteName}</td>
        <td>${trabajo.categoria || "N/A"}</td>
        <td>${trabajo.estado}</td>
        <td>${trabajo.cantidad}</td>
        <td>₡${total.toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Guardar HTML temporalmente
  const tempHtmlPath = path.join("/tmp", `resumen-${userId}-${Date.now()}.html`);
  const tempPdfPath = path.join("/tmp", `resumen-${userId}-${Date.now()}.pdf`);

  fs.writeFileSync(tempHtmlPath, html);

  // Convertir HTML a PDF usando manus-md-to-pdf (que usa weasyprint)
  try {
    execSync(`manus-md-to-pdf ${tempHtmlPath} ${tempPdfPath}`, { stdio: "pipe" });
  } catch (e) {
    // Si falla, intentar con wkhtmltopdf
    try {
      execSync(`wkhtmltopdf ${tempHtmlPath} ${tempPdfPath}`, { stdio: "pipe" });
    } catch (e2) {
      // Si todo falla, retornar HTML como fallback
      return Buffer.from(html);
    }
  }

  // Leer PDF generado
  const pdfBuffer = fs.readFileSync(tempPdfPath);

  // Limpiar archivos temporales
  fs.unlinkSync(tempHtmlPath);
  fs.unlinkSync(tempPdfPath);

  return pdfBuffer;
}
