ALTER TABLE `agregados` MODIFY COLUMN `precio` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `trabajos` MODIFY COLUMN `descripcion` text;--> statement-breakpoint
ALTER TABLE `trabajos` MODIFY COLUMN `precioBase` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `trabajos` MODIFY COLUMN `abonoInicial` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `agregados` ADD `cantidad` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `agregados` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `tipo`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `tipoPrenda`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `nivelUrgencia`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `tipoTela`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `metrosRequeridos`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `fechaPrueba`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `tipoPersonalizacion`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `fechaEntregado`;--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `notasVoz`;