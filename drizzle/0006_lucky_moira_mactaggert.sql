CREATE TABLE `ambientSounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(150) NOT NULL,
	`emoji` varchar(10) NOT NULL DEFAULT '🎵',
	`category` varchar(50) NOT NULL DEFAULT 'nature',
	`audioUrl` text,
	`durationSeconds` int DEFAULT 0,
	`isPremium` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ambientSounds_id` PRIMARY KEY(`id`),
	CONSTRAINT `ambientSounds_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `programDays` ADD `audioUrl` text;--> statement-breakpoint
ALTER TABLE `programDays` ADD `audioDurationSeconds` int DEFAULT 0;