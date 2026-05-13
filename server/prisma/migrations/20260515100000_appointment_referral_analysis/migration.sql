-- CreateTable
CREATE TABLE "AppointmentReferralAnalysis" (
    "id" TEXT NOT NULL,
    "appointmentRequestId" TEXT NOT NULL,
    "headline" TEXT,
    "detailsMarkdown" TEXT,
    "specialtyHints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "procedureHints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rawEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extractionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReferralAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentReferralAnalysis_appointmentRequestId_key" ON "AppointmentReferralAnalysis"("appointmentRequestId");

-- CreateIndex
CREATE INDEX "AppointmentReferralAnalysis_appointmentRequestId_idx" ON "AppointmentReferralAnalysis"("appointmentRequestId");

-- AddForeignKey
ALTER TABLE "AppointmentReferralAnalysis" ADD CONSTRAINT "AppointmentReferralAnalysis_appointmentRequestId_fkey" FOREIGN KEY ("appointmentRequestId") REFERENCES "AppointmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
