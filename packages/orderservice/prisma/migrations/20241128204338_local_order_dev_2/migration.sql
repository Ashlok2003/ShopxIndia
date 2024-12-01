/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "sellerId";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sellerId" TEXT NOT NULL;
