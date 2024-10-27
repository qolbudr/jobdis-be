/*
  Warnings:

  - Made the column `paid` on table `PaymentChat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PaymentChat` MODIFY `paid` BOOLEAN NOT NULL DEFAULT false;
