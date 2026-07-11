-- CreateTable
CREATE TABLE `templates` (
    `id` VARCHAR(36) NOT NULL,
    `event_type_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `strikethrough_price` DECIMAL(10, 2) NULL,
    `preview_image` TEXT NULL,
    `status` ENUM('draft', 'active', 'disabled') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `templates_slug_key`(`slug`),
    UNIQUE INDEX `templates_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fields` (
    `id` VARCHAR(36) NOT NULL,
    `identifier` VARCHAR(100) NOT NULL,
    `type` ENUM('text', 'image', 'date', 'long_text', 'location') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fields_identifier_key`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_fields` (
    `template_id` VARCHAR(36) NOT NULL,
    `field_id` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`template_id`, `field_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_fields` ADD CONSTRAINT `template_fields_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_fields` ADD CONSTRAINT `template_fields_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
