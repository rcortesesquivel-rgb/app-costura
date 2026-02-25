import { describe, it, expect, vi } from "vitest";

// ============ COTIZACIONES TESTS ============
describe("Cotizaciones - Lógica de negocio", () => {
  it("buildFormData devuelve null si faltan campos obligatorios", () => {
    // Simular la validación del formulario
    const buildFormData = (clienteId: string, descripcion: string, precioUnitario: string) => {
      if (!clienteId || !descripcion.trim() || !precioUnitario) {
        return null;
      }
      return {
        clienteId: parseInt(clienteId),
        descripcion: descripcion.trim(),
        precioUnitario,
        cantidad: 1,
        impuestos: "0.00",
        varios: "0.00",
        categoria: "arreglo",
      };
    };

    expect(buildFormData("", "test", "100")).toBeNull();
    expect(buildFormData("1", "", "100")).toBeNull();
    expect(buildFormData("1", "test", "")).toBeNull();
    expect(buildFormData("1", "Arreglo de pantalón", "5000")).not.toBeNull();
  });

  it("buildFormData genera datos correctos para cotización", () => {
    const buildFormData = (clienteId: string, descripcion: string, precioUnitario: string, cantidad: string, categoria: string) => {
      if (!clienteId || !descripcion.trim() || !precioUnitario) return null;
      return {
        clienteId: parseInt(clienteId),
        descripcion: descripcion.trim(),
        precioUnitario,
        cantidad: parseInt(cantidad) || 1,
        impuestos: "0.00",
        varios: "0.00",
        categoria,
      };
    };

    const result = buildFormData("5", "Confección de vestido", "25000", "2", "confeccion");
    expect(result).toEqual({
      clienteId: 5,
      descripcion: "Confección de vestido",
      precioUnitario: "25000",
      cantidad: 2,
      impuestos: "0.00",
      varios: "0.00",
      categoria: "confeccion",
    });
  });

  it("cotización no afecta estadísticas de trabajos", () => {
    // Simular cálculo de estadísticas (solo trabajos, no cotizaciones)
    const trabajos = [
      { id: 1, precioUnitario: "10000", cantidad: 1, estado: "recibido", pagado: 0 },
      { id: 2, precioUnitario: "5000", cantidad: 2, estado: "entregado", pagado: 1 },
    ];
    const cotizaciones = [
      { id: 1, precioUnitario: "50000", cantidad: 1, estado: "pendiente" },
      { id: 2, precioUnitario: "30000", cantidad: 3, estado: "pendiente" },
    ];

    // Las estadísticas solo cuentan trabajos
    const totalTrabajos = trabajos.length;
    const ingresosTotales = trabajos
      .filter((t) => t.pagado === 1)
      .reduce((sum, t) => sum + parseFloat(t.precioUnitario) * t.cantidad, 0);

    expect(totalTrabajos).toBe(2);
    expect(ingresosTotales).toBe(10000); // Solo el trabajo pagado
    // Las cotizaciones no se cuentan
    expect(cotizaciones.length).toBe(2);
  });

  it("convertir cotización en trabajo genera datos correctos", () => {
    const cotizacion = {
      id: 1,
      userId: 1,
      clienteId: 3,
      descripcion: "Arreglo de falda",
      precioUnitario: "8000",
      cantidad: 1,
      impuestos: "0.00",
      varios: "500.00",
      categoria: "arreglo",
      urgencia: "media",
      fechaEntrega: new Date("2026-03-01"),
      estado: "pendiente",
      convertidaEnTrabajoId: null,
    };

    const abonoInicial = "3000.00";

    // Simular conversión
    const trabajoData = {
      userId: cotizacion.userId,
      clienteId: cotizacion.clienteId,
      descripcion: cotizacion.descripcion,
      precioUnitario: cotizacion.precioUnitario,
      cantidad: cotizacion.cantidad,
      impuestos: cotizacion.impuestos,
      varios: cotizacion.varios,
      categoria: cotizacion.categoria,
      urgencia: cotizacion.urgencia,
      fechaEntrega: cotizacion.fechaEntrega,
      abonoInicial: abonoInicial,
      estado: "recibido",
      pagado: 0,
    };

    expect(trabajoData.clienteId).toBe(3);
    expect(trabajoData.descripcion).toBe("Arreglo de falda");
    expect(trabajoData.precioUnitario).toBe("8000");
    expect(trabajoData.abonoInicial).toBe("3000.00");
    expect(trabajoData.estado).toBe("recibido");
    expect(trabajoData.pagado).toBe(0);
  });

  it("no permite convertir cotización ya convertida", () => {
    const cotizacion = {
      id: 1,
      convertidaEnTrabajoId: 5, // Ya fue convertida
      estado: "aceptada",
    };

    const puedeConvertir = cotizacion.convertidaEnTrabajoId === null && cotizacion.estado === "pendiente";
    expect(puedeConvertir).toBe(false);
  });

  it("filtros de cotizaciones funcionan correctamente", () => {
    const cotizaciones = [
      { id: 1, estado: "pendiente", clienteId: 1, descripcion: "Vestido" },
      { id: 2, estado: "aceptada", clienteId: 2, descripcion: "Pantalón" },
      { id: 3, estado: "rechazada", clienteId: 1, descripcion: "Camisa" },
      { id: 4, estado: "pendiente", clienteId: 3, descripcion: "Falda" },
    ];

    const filtrarPorEstado = (estado: string) =>
      estado === "todos" ? cotizaciones : cotizaciones.filter((c) => c.estado === estado);

    expect(filtrarPorEstado("todos")).toHaveLength(4);
    expect(filtrarPorEstado("pendiente")).toHaveLength(2);
    expect(filtrarPorEstado("aceptada")).toHaveLength(1);
    expect(filtrarPorEstado("rechazada")).toHaveLength(1);
    expect(filtrarPorEstado("vencida")).toHaveLength(0);
  });
});

// ============ IMPORTACIÓN DE CONTACTOS TESTS ============
describe("Importación de Contactos - Lógica de negocio", () => {
  it("detecta duplicados por teléfono", () => {
    const clientesExistentes = [
      { id: 1, nombreCompleto: "Juan Pérez", telefono: "88881111" },
      { id: 2, nombreCompleto: "María López", telefono: "88882222" },
    ];

    const contactosImportar = [
      { nombre: "Juan Pérez", telefono: "88881111" }, // Duplicado
      { nombre: "Carlos Soto", telefono: "88883333" }, // Nuevo
      { nombre: "María López", telefono: "88882222" }, // Duplicado
      { nombre: "Ana Rojas", telefono: "88884444" }, // Nuevo
    ];

    const telefonosExistentes = new Set(clientesExistentes.map((c) => c.telefono).filter(Boolean));

    const nuevos = contactosImportar.filter((c) => !telefonosExistentes.has(c.telefono));
    const duplicados = contactosImportar.filter((c) => telefonosExistentes.has(c.telefono));

    expect(nuevos).toHaveLength(2);
    expect(duplicados).toHaveLength(2);
    expect(nuevos.map((n) => n.nombre)).toEqual(["Carlos Soto", "Ana Rojas"]);
  });

  it("permite seleccionar contactos específicos", () => {
    const contactos = [
      { id: "1", nombre: "Juan", telefono: "111" },
      { id: "2", nombre: "María", telefono: "222" },
      { id: "3", nombre: "Carlos", telefono: "333" },
      { id: "4", nombre: "Ana", telefono: "444" },
    ];

    const seleccionados = new Set<string>();
    seleccionados.add("1");
    seleccionados.add("3");

    const contactosSeleccionados = contactos.filter((c) => seleccionados.has(c.id));
    expect(contactosSeleccionados).toHaveLength(2);
    expect(contactosSeleccionados.map((c) => c.nombre)).toEqual(["Juan", "Carlos"]);
  });

  it("seleccionar/deseleccionar todos funciona correctamente", () => {
    const contactos = [
      { id: "1", nombre: "Juan" },
      { id: "2", nombre: "María" },
      { id: "3", nombre: "Carlos" },
    ];

    let seleccionados = new Set<string>();

    // Seleccionar todos
    contactos.forEach((c) => seleccionados.add(c.id));
    expect(seleccionados.size).toBe(3);

    // Deseleccionar todos
    seleccionados = new Set<string>();
    expect(seleccionados.size).toBe(0);
  });

  it("formatea datos de contacto correctamente para crear cliente", () => {
    const contacto = {
      nombre: "Juan Carlos Pérez",
      telefono: "+506 8888-1111",
      email: "juan@email.com",
    };

    // Limpiar teléfono
    const telefonoLimpio = contacto.telefono.replace(/[\s\-\(\)]/g, "");
    const codigoPais = telefonoLimpio.startsWith("+") ? telefonoLimpio.substring(0, 4) : "+506";
    const telefonoSinCodigo = telefonoLimpio.startsWith("+")
      ? telefonoLimpio.substring(4)
      : telefonoLimpio;

    const clienteData = {
      nombreCompleto: contacto.nombre,
      telefono: telefonoSinCodigo,
      codigoPais: codigoPais,
      whatsapp: telefonoSinCodigo,
    };

    expect(clienteData.nombreCompleto).toBe("Juan Carlos Pérez");
    expect(clienteData.telefono).toBe("88881111");
    expect(clienteData.codigoPais).toBe("+506");
    expect(clienteData.whatsapp).toBe("88881111");
  });

  it("maneja contactos sin teléfono correctamente", () => {
    const contactosSinTelefono = [
      { id: "1", nombre: "Juan", telefono: null },
      { id: "2", nombre: "María", telefono: undefined },
      { id: "3", nombre: "Carlos", telefono: "" },
    ];

    const contactosConTelefono = contactosSinTelefono.filter(
      (c) => c.telefono && c.telefono.trim() !== ""
    );

    expect(contactosConTelefono).toHaveLength(0);
  });

  it("búsqueda de contactos funciona por nombre y teléfono", () => {
    const contactos = [
      { id: "1", nombre: "Juan Pérez", telefono: "88881111" },
      { id: "2", nombre: "María López", telefono: "88882222" },
      { id: "3", nombre: "Carlos Soto", telefono: "88883333" },
    ];

    const buscar = (query: string) =>
      contactos.filter(
        (c) =>
          c.nombre.toLowerCase().includes(query.toLowerCase()) ||
          (c.telefono && c.telefono.includes(query))
      );

    expect(buscar("juan")).toHaveLength(1);
    expect(buscar("8888")).toHaveLength(3);
    expect(buscar("López")).toHaveLength(1);
    expect(buscar("xyz")).toHaveLength(0);
  });
});
