-- CreateTable
CREATE TABLE `PaymentChat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `consultantId` INTEGER NOT NULL,
    `elapsedDuration` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NOT NULL,
    `paymentProof` VARCHAR(191) NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentChat` ADD CONSTRAINT `PaymentChat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentChat` ADD CONSTRAINT `PaymentChat_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
