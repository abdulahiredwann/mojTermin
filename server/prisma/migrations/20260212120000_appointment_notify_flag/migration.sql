-- Optional notifications when a slot becomes available (delivery worker not implemented yet)
ALTER TABLE "AppointmentRequest" ADD COLUMN "notifyWhenAvailable" BOOLEAN NOT NULL DEFAULT false;
