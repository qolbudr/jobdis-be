/*
  Warnings:

  - You are about to drop the column `work_type` on the `JobVacancy` table. All the data in the column will be lost.
  - Added the required column `workType` to the `JobVacancy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `JobVacancy` DROP COLUMN `work_type`,
    ADD COLUMN `workType` ENUM('freelance', 'fulltime', 'parttime', 'internship') NOT NULL;
