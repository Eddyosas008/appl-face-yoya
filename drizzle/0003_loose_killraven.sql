CREATE TABLE `programDays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programSlug` varchar(100) NOT NULL,
	`dayNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`theme` varchar(255),
	`description` text,
	`meditationSlug` varchar(100),
	`breathingExercise` varchar(50),
	`ambientSound` varchar(50),
	`eveningRoutine` text,
	`sleepTip` text,
	`journalPrompt` text,
	`estimatedMinutes` int NOT NULL DEFAULT 15,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `programDays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleepPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`description` text,
	`emoji` varchar(10) DEFAULT '🌙',
	`durationDays` int NOT NULL,
	`targetIssue` varchar(100),
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`isPremium` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`coverColor` varchar(20) DEFAULT '#1E1B4B',
	`coverColor2` varchar(20) DEFAULT '#312E81',
	`sortOrder` int NOT NULL DEFAULT 0,
	`totalEnrollments` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sleepPrograms_id` PRIMARY KEY(`id`),
	CONSTRAINT `sleepPrograms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userProgramProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programSlug` varchar(100) NOT NULL,
	`currentDay` int NOT NULL DEFAULT 1,
	`completedDays` text NOT NULL DEFAULT ('[]'),
	`isCompleted` boolean NOT NULL DEFAULT false,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userProgramProgress_id` PRIMARY KEY(`id`)
);
