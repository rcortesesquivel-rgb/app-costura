CREATE TABLE `cotizaciones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clienteId` int NOT NULL,
	`descripcion` text,
	`precioUnitario` decimal(12,2) DEFAULT '0.00',
	`cantidad` int NOT NULL DEFAULT 1,
	`impuestos` decimal(12,2) DEFAULT '0.00',
	`varios` decimal(12,2) DEFAULT '0.00',
	`cotizacion_categoria` enum('arreglo','confeccion','bordado','sublimado','otros') NOT NULL DEFAULT 'otros',
	`cotizacion_urgencia` enum('baja','media','alta'),
	`fechaEntrega` timestamp,
	`condicionesPago` text,
	`cotizacion_estado` enum('pendiente','aceptada','rechazada','vencida') NOT NULL DEFAULT 'pendiente',
	`convertidaEnTrabajoId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cotizaciones_id` PRIMARY KEY(`id`)
);
