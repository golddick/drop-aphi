-- CreateEnum
CREATE TYPE "BlogTemplate" AS ENUM ('DEFAULT', 'CLASSIC', 'MODERN');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "template" "BlogTemplate" NOT NULL DEFAULT 'DEFAULT';

-- CreateTable
CREATE TABLE "platform_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'SUBSCRIBED',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_subscribers_email_key" ON "platform_subscribers"("email");
