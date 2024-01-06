-- DropForeignKey
ALTER TABLE `Email` DROP FOREIGN KEY `Email_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Email` DROP FOREIGN KEY `Email_domainId_fkey`;

-- DropForeignKey
ALTER TABLE `UserHasDomain` DROP FOREIGN KEY `UserHasDomain_domainId_fkey`;

-- DropForeignKey
ALTER TABLE `UserHasDomain` DROP FOREIGN KEY `UserHasDomain_userId_fkey`;

-- AddForeignKey
ALTER TABLE `UserHasDomain` ADD CONSTRAINT `UserHasDomain_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserHasDomain` ADD CONSTRAINT `UserHasDomain_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
