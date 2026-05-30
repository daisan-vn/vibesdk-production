CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text,
	`user_id` text,
	`status` text NOT NULL,
	`deployment_url` text,
	`deployment_id` text,
	`target` text,
	`error` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deployments_app_idx` ON `deployments` (`app_id`);--> statement-breakpoint
CREATE INDEX `deployments_user_idx` ON `deployments` (`user_id`);--> statement-breakpoint
CREATE INDEX `deployments_created_idx` ON `deployments` (`created_at`);