-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ShelfEventType" ADD VALUE 'BOOK_RETURNED';
ALTER TYPE "ShelfEventType" ADD VALUE 'BOOK_BORROWED';
ALTER TYPE "ShelfEventType" ADD VALUE 'SECURITY_ALERT';

-- CreateTable
CREATE TABLE "SmartShelfSession" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SmartShelfSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SmartShelfSession" ADD CONSTRAINT "SmartShelfSession_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;
