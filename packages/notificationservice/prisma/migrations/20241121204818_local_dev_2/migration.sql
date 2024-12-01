/*
  Warnings:

  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Notification` table. All the data in the column will be lost.
  - The required column `notificationId` was added to the `Notification` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "id",
ADD COLUMN     "notificationId" TEXT NOT NULL,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId");
