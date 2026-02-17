CREATE TABLE `agregados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trabajoId` int NOT NULL,
	`concepto` varchar(255) NOT NULL,
	`precio` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agregados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombreCompleto` varchar(255) NOT NULL,
	`telefono` varchar(20),
	`direccion` text,
	`redesSociales` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historialEstados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trabajoId` int NOT NULL,
	`estadoAnterior` varchar(50),
	`estadoNuevo` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historialEstados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trabajoId` int NOT NULL,
	`url` text NOT NULL,
	`tipo` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medidas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`cuello` varchar(10),
	`hombros` varchar(10),
	`pecho` varchar(10),
	`cintura` varchar(10),
	`cadera` varchar(10),
	`largoManga` varchar(10),
	`largoEspalda` varchar(10),
	`largoPantalon` varchar(10),
	`entrepierna` varchar(10),
	`contornoBrazo` varchar(10),
	`anchoPecho` varchar(10),
	`anchoEspalda` varchar(10),
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medidas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trabajos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`tipo` enum('arreglo','confeccion','personalizacion') NOT NULL,
	`descripcion` text NOT NULL,
	`precioBase` varchar(20) NOT NULL,
	`abonoInicial` varchar(20) NOT NULL DEFAULT '0',
	`tipoPrenda` varchar(100),
	`nivelUrgencia` enum('baja','media','alta'),
	`tipoTela` varchar(100),
	`metrosRequeridos` varchar(10),
	`fechaPrueba` timestamp,
	`tipoPersonalizacion` varchar(100),
	`estado` enum('en_espera','cortando','cosiendo','listo','entregado') NOT NULL DEFAULT 'en_espera',
	`fechaEntrega` timestamp,
	`fechaEntregado` timestamp,
	`notasVoz` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trabajos_id` PRIMARY KEY(`id`)
);
