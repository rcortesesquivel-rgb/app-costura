CREATE TABLE `emailsAutorizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`nombre` varchar(255),
	`plan` enum('basic','vip','lifetime') NOT NULL DEFAULT 'basic',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailsAutorizados_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailsAutorizados_email_unique` UNIQUE(`email`)
);
