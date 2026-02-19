CREATE TABLE `audios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trabajoId` int NOT NULL,
	`url` text NOT NULL,
	`duracion` int NOT NULL DEFAULT 0,
	`descripcion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audios_id` PRIMARY KEY(`id`)
);
