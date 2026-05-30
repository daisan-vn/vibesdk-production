CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`app_id` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`goal` text,
	`content` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `plans_user_idx` ON `plans` (`user_id`);--> statement-breakpoint
CREATE INDEX `plans_app_idx` ON `plans` (`app_id`);--> statement-breakpoint
CREATE INDEX `plans_status_idx` ON `plans` (`status`);