-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SECURITY_ALERT', 'PROBLEMATIC_PATRON', 'UNAUTHORIZED_BOOK', 'BOOK_BORROWED', 'BOOK_RETURNED', 'SYSTEM_ALERT', 'INFO');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "patronRfid" TEXT,
    "bookRfid" TEXT,
    "shelfActivityId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
