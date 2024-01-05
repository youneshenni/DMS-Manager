/*
  Warnings:

  - You are about to drop the column `adminId` on the `Domain` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Domain` DROP FOREIGN KEY `Domain_adminId_fkey`;

-- AlterTable
ALTER TABLE `Domain` DROP COLUMN `adminId`;

-- CreateTable
CREATE TABLE `UserHasDomain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `domainId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DomainToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DomainToUser_AB_unique`(`A`, `B`),
    INDEX `_DomainToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserHasDomain` ADD CONSTRAINT `UserHasDomain_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserHasDomain` ADD CONSTRAINT `UserHasDomain_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DomainToUser` ADD CONSTRAINT `_DomainToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DomainToUser` ADD CONSTRAINT `_DomainToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
