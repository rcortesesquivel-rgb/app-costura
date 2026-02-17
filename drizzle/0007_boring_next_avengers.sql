ALTER TABLE `users` ADD `storageUsedMB` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `storageQuotaMB` int DEFAULT 1024 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isPriority` int DEFAULT 0 NOT NULL;