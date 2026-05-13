-- Allow multiple referral images per appointment request

ALTER TABLE "AppointmentRequest" ADD COLUMN "referralImagePaths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "AppointmentRequest"
SET "referralImagePaths" = ARRAY["referralImagePath"]::TEXT[]
WHERE "referralImagePath" IS NOT NULL;

ALTER TABLE "AppointmentRequest" DROP COLUMN "referralImagePath";
