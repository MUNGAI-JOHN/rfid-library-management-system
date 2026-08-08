-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('BOOK_REMOVED');

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "bookRfid" TEXT NOT NULL,
    "shelfName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "eventType" "SecurityEventType" NOT NULL DEFAULT 'BOOK_REMOVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_bookRfid_fkey" FOREIGN KEY ("bookRfid") REFERENCES "Book"("rfid_bid") ON DELETE RESTRICT ON UPDATE CASCADE;
