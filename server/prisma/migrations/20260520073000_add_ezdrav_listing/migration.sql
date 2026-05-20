-- CreateTable
CREATE TABLE "EzdravListing" (
    "id" TEXT NOT NULL,
    "routeId" TEXT,
    "serviceName" TEXT,
    "urgency" TEXT,
    "urgencyPage" TEXT,
    "region" TEXT,
    "provider" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "websiteDisabled" BOOLEAN NOT NULL DEFAULT false,
    "serviceUnavailable" BOOLEAN NOT NULL DEFAULT false,
    "eOrderNotPossible" BOOLEAN NOT NULL DEFAULT false,
    "appointmentSummary" TEXT,
    "remarks" TEXT,
    "ambulances" TEXT,
    "lastUpdated" TEXT,
    "sourceFile" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EzdravListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EzdravListing_city_idx" ON "EzdravListing"("city");

-- CreateIndex
CREATE INDEX "EzdravListing_provider_idx" ON "EzdravListing"("provider");

-- CreateIndex
CREATE INDEX "EzdravListing_serviceName_idx" ON "EzdravListing"("serviceName");

-- CreateIndex
CREATE INDEX "EzdravListing_urgency_idx" ON "EzdravListing"("urgency");

-- CreateIndex
CREATE INDEX "EzdravListing_region_idx" ON "EzdravListing"("region");

-- CreateIndex
CREATE INDEX "EzdravListing_routeId_idx" ON "EzdravListing"("routeId");
