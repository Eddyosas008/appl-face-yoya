CREATE TABLE `meditationCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`emoji` varchar(10),
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meditationCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `meditationCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `meditationRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`meditationId` int NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meditationRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`description` text,
	`audioUrl` text NOT NULL,
	`audioDurationSeconds` int NOT NULL DEFAULT 0,
	`audioSizeBytes` int DEFAULT 0,
	`categorySlug` varchar(50) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`tags` text,
	`instructor` varchar(100) NOT NULL DEFAULT 'Yoya',
	`language` varchar(10) NOT NULL DEFAULT 'fr',
	`scriptText` text,
	`coverColor` varchar(20) DEFAULT '#7C3AED',
	`coverImageUrl` text,
	`isPremium` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`playCount` int NOT NULL DEFAULT 0,
	`averageRating` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meditations_id` PRIMARY KEY(`id`),
	CONSTRAINT `meditations_slug_unique` UNIQUE(`slug`)
);
