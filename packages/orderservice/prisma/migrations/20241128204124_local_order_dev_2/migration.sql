-- CreateEnum
CREATE TYPE "ORDER_STATUS" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'OUT_FOR_DELIVERY', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PAYMENT_STATUS" AS ENUM ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Order" (
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "orderStatus" "ORDER_STATUS" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PAYMENT_STATUS" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderOrderId" TEXT NOT NULL,
    "productPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_id" ON "Order"("paymentId");

-- CreateIndex
CREATE INDEX "idx_user_id" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "idx_order_order_id" ON "OrderItem"("orderOrderId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderOrderId_fkey" FOREIGN KEY ("orderOrderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
