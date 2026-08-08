/*
  Warnings:

  - You are about to drop the column `shelfName` on the `Book` table. All the data in the column will be lost.
  - Added the required column `shelfId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "shelfName",
ADD COLUMN     "shelfId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Shelf" (
    "id" SERIAL NOT NULL,
    "shelfName" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shelf_shelfName_key" ON "Shelf"("shelfName");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
