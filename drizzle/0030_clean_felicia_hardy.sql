ALTER TABLE `emailsAutorizados` ADD `status` enum('prueba','pagado') DEFAULT 'pagado' NOT NULL;--> statement-breakpoint
ALTER TABLE `emailsAutorizados` ADD `expiresAt` timestamp;