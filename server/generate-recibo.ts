import type { Express } from "express";
import { getDb } from "./db";
import { trabajos, clientes, agregados } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Formatea un número como moneda CRC (Colones costarricenses)
 */
function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₡0.00';
  
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Genera un recibo en PDF para un trabajo específico
 */
export function setupReciboRoutes(app: Express) {
  app.get("/api/recibo/:trabajoId", async (req, res) => {
    try {
      const trabajoId = parseInt(req.params.trabajoId);
      
      if (isNaN(trabajoId)) {
        res.status(400).json({ error: "ID de trabajo inválido" });
        return;
      }

      const db = await getDb();
      
      if (!db) {
        res.status(500).json({ error: "Error de base de datos" });
        return;
      }
      
      // Obtener trabajo con cliente
      const [trabajo] = await db
        .select()
        .from(trabajos)
        .where(eq(trabajos.id, trabajoId));

      if (!trabajo) {
        res.status(404).json({ error: "Trabajo no encontrado" });
        return;
      }

      const [cliente] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.id, trabajo.clienteId));

      if (!cliente) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }

      // Calcular totales
      const precioBase = parseFloat(trabajo.precioBase || "0") || 0;
      const abonoInicial = parseFloat(trabajo.abonoInicial || "0") || 0;
      
      // Obtener agregados del trabajo
      const agregadosData = await db
        .select()
        .from(agregados)
        .where(eq(agregados.trabajoId, trabajoId));
      
      const totalAgregados = agregadosData.reduce((sum: number, item: any) => {
        const precio = typeof item.precio === 'string' ? parseFloat(item.precio) : item.precio;
        const cantidad = typeof item.cantidad === 'string' ? parseFloat(item.cantidad) : (item.cantidad || 1);
        return sum + (precio * cantidad);
      }, 0);
      
      const total = precioBase + totalAgregados;
      const saldo = total - abonoInicial;

      // Generar HTML del recibo
      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo - Trabajo #${trabajo.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
    }
    
    .recibo {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #0a7ea4;
      border-radius: 12px;
      padding: 30px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #0a7ea4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #0a7ea4;
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .header p {
      color: #687076;
      font-size: 14px;
    }
    
    .info-section {
      margin-bottom: 25px;
    }
    
    .info-section h2 {
      color: #0a7ea4;
      font-size: 18px;
      margin-bottom: 12px;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 6px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dotted #E5E7EB;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: #687076;
    }
    
    .info-value {
      color: #11181C;
    }
    
    .desglose-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    .desglose-table th {
      background-color: #f5f5f5;
      color: #11181C;
      font-weight: 600;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #0a7ea4;
    }
    
    .desglose-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #E5E7EB;
    }
    
    .desglose-table tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totales {
      margin-top: 25px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }
    
    .total-row.final {
      font-size: 20px;
      font-weight: bold;
      color: #0a7ea4;
      border-top: 2px solid #0a7ea4;
      padding-top: 12px;
      margin-top: 8px;
    }
    
    .saldo-pendiente {
      color: #EF4444;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #687076;
      font-size: 12px;
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .recibo {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <h1>Taller de Costura</h1>
      <p>Recibo de Trabajo #${trabajo.id}</p>
      <p>Fecha: ${new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="info-section">
      <h2>Información del Cliente</h2>
      <div class="info-row">
        <span class="info-label">Nombre:</span>
        <span class="info-value">${cliente.nombreCompleto}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Teléfono:</span>
        <span class="info-value">${cliente.telefono || 'No especificado'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dirección:</span>
        <span class="info-value">${cliente.direccion || 'No especificada'}</span>
      </div>
    </div>
    
    <div class="info-section">
      <h2>Detalles del Trabajo</h2>
      <div class="info-row">
        <span class="info-label">Descripción:</span>
        <span class="info-value">${trabajo.descripcion || 'Sin descripción'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value">${trabajo.estado.replace('_', ' ').charAt(0).toUpperCase() + trabajo.estado.replace('_', ' ').slice(1)}</span>
      </div>
    </div>
    
    <div class="info-section">
      <h2>Desglose de Costos</h2>
      <table class="desglose-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Precio Unit.</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Precio base del trabajo</td>
            <td class="text-right">1</td>
            <td class="text-right">${formatCurrency(precioBase)}</td>
            <td class="text-right">${formatCurrency(precioBase)}</td>
          </tr>
          ${agregadosData.map((item: any) => {
            const precioUnit = parseFloat(item.precio || '0');
            const cant = item.cantidad || 1;
            return `
          <tr>
            <td>${item.concepto}</td>
            <td class="text-right">${cant}</td>
            <td class="text-right">${formatCurrency(precioUnit)}</td>
            <td class="text-right">${formatCurrency(precioUnit * cant)}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="totales">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <div class="total-row">
        <span>Abono inicial:</span>
        <span>-${formatCurrency(abonoInicial)}</span>
      </div>
      <div class="total-row final">
        <span class="${saldo > 0 ? 'saldo-pendiente' : ''}">Saldo pendiente:</span>
        <span class="${saldo > 0 ? 'saldo-pendiente' : ''}">${formatCurrency(saldo)}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>Gracias por confiar en nuestro taller</p>
      <p>Este recibo es un comprobante de los servicios acordados</p>
    </div>
  </div>
</body>
</html>
      `;

      // Enviar HTML como respuesta
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      
    } catch (error) {
      console.error("[Recibo] Error generando recibo:", error);
      res.status(500).json({ error: "Error generando recibo" });
    }
  });
}
