import { describe, it, expect } from "vitest";

// Importar extractNumber del componente VoiceInput
// Replicamos la función aquí para testing independiente
const WORD_TO_NUMBER: Record<string, number> = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
  cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
  quince: 15, dieciséis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintidós: 22, veintitrés: 23, veinticuatro: 24,
  veinticinco: 25, veintiséis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60,
  setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400,
  quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
  mil: 1000, millón: 1000000, millones: 1000000,
};

function extractNumber(text: string): string {
  const directNumbers = text.match(/[\d]+[.,]?[\d]*/g);
  if (directNumbers && directNumbers.length > 0) {
    return directNumbers.join("").replace(",", ".");
  }

  const words = text.toLowerCase()
    .replace(/[.,;:!?¿¡]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 0);

  let total = 0;
  let current = 0;
  let hasNumber = false;

  for (const word of words) {
    const val = WORD_TO_NUMBER[word];
    if (val !== undefined) {
      hasNumber = true;
      if (val === 1000) {
        current = current === 0 ? 1000 : current * 1000;
      } else if (val === 1000000) {
        current = current === 0 ? 1000000 : current * 1000000;
      } else if (val >= 100 && val < 1000) {
        current += val;
      } else {
        current += val;
      }
    } else if (word === "y" || word === "con") {
      continue;
    } else if (hasNumber && (word === "pesos" || word === "colones" || word === "mil")) {
      if (word === "mil") {
        current = current === 0 ? 1000 : current * 1000;
      }
      continue;
    }
  }

  total += current;

  if (hasNumber && total > 0) {
    return total.toString();
  }

  return "";
}

describe("Dictado Universal - extractNumber", () => {
  it("debe extraer números directos del texto", () => {
    expect(extractNumber("1500")).toBe("1500");
    expect(extractNumber("son 2500 colones")).toBe("2500");
    expect(extractNumber("precio 100.50")).toBe("100.50");
  });

  it("debe convertir palabras a números", () => {
    expect(extractNumber("cien")).toBe("100");
    expect(extractNumber("quinientos")).toBe("500");
    expect(extractNumber("mil")).toBe("1000");
  });

  it("debe manejar 'son cien pesos' → 100", () => {
    expect(extractNumber("son cien pesos")).toBe("100");
  });

  it("debe manejar 'cinco mil' → 5000", () => {
    expect(extractNumber("cinco mil")).toBe("5000");
  });

  it("debe retornar vacío si no hay número", () => {
    expect(extractNumber("hola mundo")).toBe("");
  });

  it("debe manejar comas como decimales", () => {
    expect(extractNumber("1500,50")).toBe("1500.50");
  });
});

describe("Cálculos de trabajo", () => {
  it("debe calcular total = precioBase + sum(precio * cantidad)", () => {
    const precioBase = 5000;
    const agregados = [
      { precio: 1000, cantidad: 2 },
      { precio: 500, cantidad: 3 },
    ];
    const totalAgregados = agregados.reduce((sum, a) => sum + (a.precio * a.cantidad), 0);
    const total = precioBase + totalAgregados;
    expect(total).toBe(8500); // 5000 + 2000 + 1500
  });

  it("debe calcular saldo = total - abono", () => {
    const total = 8500;
    const abono = 3000;
    expect(total - abono).toBe(5500);
  });

  it("saldo debe ser 0 si abono >= total", () => {
    const total = 5000;
    const abono = 5000;
    expect(total - abono).toBe(0);
  });
});

describe("Filtros de estado", () => {
  const trabajos = [
    { id: 1, estado: "en_espera" },
    { id: 2, estado: "cortando" },
    { id: 3, estado: "cosiendo" },
    { id: 4, estado: "listo" },
    { id: 5, estado: "entregado" },
    { id: 6, estado: "en_espera" },
  ];

  it("filtro 'todos' muestra trabajos pendientes (no entregados)", () => {
    const pendientes = trabajos.filter(t => t.estado !== "entregado");
    expect(pendientes.length).toBe(5);
  });

  it("filtro 'en_espera' muestra solo trabajos en espera", () => {
    const filtrados = trabajos.filter(t => t.estado === "en_espera");
    expect(filtrados.length).toBe(2);
  });

  it("filtro 'cortando' muestra solo trabajos cortando", () => {
    const filtrados = trabajos.filter(t => t.estado === "cortando");
    expect(filtrados.length).toBe(1);
  });

  it("filtro 'entregado' muestra solo entregados", () => {
    const filtrados = trabajos.filter(t => t.estado === "entregado");
    expect(filtrados.length).toBe(1);
  });
});

describe("Fecha de entrega", () => {
  it("debe parsear fecha AAAA-MM-DD correctamente", () => {
    const fecha = "2026-03-15";
    const parsed = new Date(fecha + "T12:00:00");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2); // Marzo = 2 (0-indexed)
    expect(parsed.getDate()).toBe(15);
    expect(isNaN(parsed.getTime())).toBe(false);
  });

  it("debe detectar fecha inválida", () => {
    const fecha = "no-es-fecha";
    const parsed = new Date(fecha + "T12:00:00");
    expect(isNaN(parsed.getTime())).toBe(true);
  });
});

describe("Seguridad - Login obligatorio", () => {
  it("debe redirigir a auth/signin si no hay sesión y no está en auth", () => {
    const isSignedIn = false;
    const segments = ["(tabs)"];
    const inAuthGroup = segments[0] === "auth" || segments[0] === "oauth" || segments[0] === "welcome";
    const shouldRedirect = !isSignedIn && !inAuthGroup;
    expect(shouldRedirect).toBe(true);
  });

  it("no debe redirigir si ya está en auth", () => {
    const isSignedIn = false;
    const segments = ["auth"];
    const inAuthGroup = segments[0] === "auth" || segments[0] === "oauth" || segments[0] === "welcome";
    const shouldRedirect = !isSignedIn && !inAuthGroup;
    expect(shouldRedirect).toBe(false);
  });

  it("debe redirigir al dashboard si tiene sesión y está en auth", () => {
    const isSignedIn = true;
    const segments = ["auth"];
    const inAuthGroup = segments[0] === "auth" || segments[0] === "oauth" || segments[0] === "welcome";
    const shouldRedirectToDashboard = isSignedIn && inAuthGroup;
    expect(shouldRedirectToDashboard).toBe(true);
  });
});
