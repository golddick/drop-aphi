/*
  Warnings:

  - Added the required column `appName` to the `ThirdPartyOTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ThirdPartyOTP" ADD COLUMN     "appName" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
