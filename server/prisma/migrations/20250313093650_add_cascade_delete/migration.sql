-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `images_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
