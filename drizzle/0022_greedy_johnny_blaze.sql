ALTER TABLE `trabajos` MODIFY COLUMN `categoria` enum('arreglo','confeccion','bordado','sublimado','otros') NOT NULL DEFAULT 'otros';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `telefono`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `codigoPais`;