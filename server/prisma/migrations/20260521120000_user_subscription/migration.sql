-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3);
