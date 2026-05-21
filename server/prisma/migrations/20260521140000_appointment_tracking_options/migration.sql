-- AlterTable
ALTER TABLE "AppointmentRequest" ADD COLUMN "notifyEmail" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppointmentRequest" ADD COLUMN "notifyFasterRefresh" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppointmentRequest" ADD COLUMN "notifySms" BOOLEAN NOT NULL DEFAULT false;

UPDATE "AppointmentRequest" SET "notifySms" = "notifyWhenAvailable" WHERE "notifyWhenAvailable" = true;
