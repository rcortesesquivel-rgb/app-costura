ALTER TABLE `trabajos` MODIFY COLUMN `categoria` enum('reparacion','confeccion','bordado','sublimado','otros') NOT NULL DEFAULT 'otros';--> statement-breakpoint
ALTER TABLE `trabajos` ADD `precioUnitario` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `trabajos` DROP COLUMN `precioBase`;