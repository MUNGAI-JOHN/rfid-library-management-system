-- CreateEnum
CREATE TYPE "PatronStatus" AS ENUM ('PROBLEMATIC_PATRON', 'NORMAL_PATRON');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patron" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "rfid_uid" TEXT NOT NULL,
    "status" "PatronStatus" NOT NULL DEFAULT 'NORMAL_PATRON',

    CONSTRAINT "Patron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "rfid_bid" TEXT NOT NULL,
    "shelfName" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowingBook" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "bookRfid" TEXT NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnedDate" TIMESTAMP(3),

    CONSTRAINT "BorrowingBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntranceLogs" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "entranceTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntranceLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitLogs" (
    "id" SERIAL NOT NULL,
    "patronRfid" TEXT NOT NULL,
    "bookRfid" TEXT,
    "bookAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "exitTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExitLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patron_rfid_uid_key" ON "Patron"("rfid_uid");

-- CreateIndex
CREATE UNIQUE INDEX "Book_bookTitle_key" ON "Book"("bookTitle");

-- CreateIndex
CREATE UNIQUE INDEX "Book_rfid_bid_key" ON "Book"("rfid_bid");

-- AddForeignKey
ALTER TABLE "BorrowingBook" ADD CONSTRAINT "BorrowingBook_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowingBook" ADD CONSTRAINT "BorrowingBook_bookRfid_fkey" FOREIGN KEY ("bookRfid") REFERENCES "Book"("rfid_bid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntranceLogs" ADD CONSTRAINT "EntranceLogs_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitLogs" ADD CONSTRAINT "ExitLogs_patronRfid_fkey" FOREIGN KEY ("patronRfid") REFERENCES "Patron"("rfid_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitLogs" ADD CONSTRAINT "ExitLogs_bookRfid_fkey" FOREIGN KEY ("bookRfid") REFERENCES "Book"("rfid_bid") ON DELETE SET NULL ON UPDATE CASCADE;
