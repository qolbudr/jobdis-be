/*
  Warnings:

  - You are about to drop the column `consultantId` on the `PaymentChat` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `PaymentChat` table. All the data in the column will be lost.
  - You are about to drop the column `elapsedDuration` on the `PaymentChat` table. All the data in the column will be lost.
  - Added the required column `sessionId` to the `PaymentChat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PaymentChat` DROP FOREIGN KEY `PaymentChat_consultantId_fkey`;

-- AlterTable
ALTER TABLE `PaymentChat` DROP COLUMN `consultantId`,
    DROP COLUMN `duration`,
    DROP COLUMN `elapsedDuration`,
    ADD COLUMN `sessionId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ChatSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultantId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `status` ENUM('online', 'busy', 'offline') NOT NULL,

    UNIQUE INDEX `ChatSession_consultantId_key`(`consultantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentChat` ADD CONSTRAINT `PaymentChat_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
