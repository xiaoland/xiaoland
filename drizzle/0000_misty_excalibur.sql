CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`sent_by` text NOT NULL,
	`article_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`avatar_url` text,
	`email` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `xenix_download_users` (
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xenix_download_users_email_unique` ON `xenix_download_users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `xenix_download_users_phone_unique` ON `xenix_download_users` (`phone`);