-- AlterTable
ALTER TABLE `users` ADD COLUMN `profile_pic` TEXT NULL;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `url` TEXT NULL,
    `event_type_id` VARCHAR(36) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `events_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_templates` (
    `id` VARCHAR(36) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `template_id` VARCHAR(36) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_template_fields` (
    `event_template_id` VARCHAR(36) NOT NULL,
    `field_id` VARCHAR(36) NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`event_template_id`, `field_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_templates` ADD CONSTRAINT `event_templates_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_templates` ADD CONSTRAINT `event_templates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_template_fields` ADD CONSTRAINT `event_template_fields_event_template_id_fkey` FOREIGN KEY (`event_template_id`) REFERENCES `event_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_template_fields` ADD CONSTRAINT `event_template_fields_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
