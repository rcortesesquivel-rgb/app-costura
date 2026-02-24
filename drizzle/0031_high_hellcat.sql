CREATE TABLE `sugerencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`nombreUsuario` varchar(255),
	`emailUsuario` varchar(320),
	`asunto` varchar(500) NOT NULL,
	`mensaje` text NOT NULL,
	`leida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sugerencias_id` PRIMARY KEY(`id`)
);
