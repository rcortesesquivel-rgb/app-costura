ALTER TABLE `users` ADD `plan` enum('monthly','lifetime') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `audioTranscriptionsThisMonth` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastAudioResetDate` timestamp DEFAULT (now()) NOT NULL;