/*
  Warnings:

  - Added the required column `billingCycle` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billingCycle" TEXT NOT NULL,
ADD COLUMN     "plan" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "blogPostLimit" SET DEFAULT 5;
