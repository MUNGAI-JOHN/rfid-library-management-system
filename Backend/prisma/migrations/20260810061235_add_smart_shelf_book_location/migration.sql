/*
  Warnings:

  - You are about to drop the column `available` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the `SecurityEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookLocation" AS ENUM ('ON_SHELF', 'IN_LIBRARY', 'WITH_PATRON');

-- CreateEnum
CREATE TYPE "ShelfEventType" AS ENUM ('PATRON_DETECTED', 'BOOK_PICKED');

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_bookRfid_fkey";

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_patronRfid_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "available",
ADD COLUMN     "location" "BookLocation" NOT NULL DEFAULT 'ON_SHELF';

-- DropTable
DROP TABLE "SecurityEvent";

-- DropEnum
DROP TYPE "SecurityEventType";

-- CreateTable
CREATE TABLE "ShelfActivity" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "bookRfid" TEXT,
    "imageUrl" TEXT,
    "eventType" "ShelfEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShelfActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShelfActivity" ADD CONSTRAINT "ShelfActivity_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfActivity" ADD CONSTRAINT "ShelfActivity_bookRfid_fkey" FOREIGN KEY ("bookRfid") REFERENCES "Book"("rfid_bid") ON DELETE SET NULL ON UPDATE CASCADE;
