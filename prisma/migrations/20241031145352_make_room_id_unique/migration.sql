/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `PaymentChat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PaymentChat_roomId_key` ON `PaymentChat`(`roomId`);
