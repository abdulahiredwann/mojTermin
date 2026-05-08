-- CreateTable
CREATE TABLE "AdminHospitalChatSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminHospitalChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminHospitalChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminHospitalChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminHospitalChatSession_adminId_idx" ON "AdminHospitalChatSession"("adminId");

-- CreateIndex
CREATE INDEX "AdminHospitalChatMessage_sessionId_idx" ON "AdminHospitalChatMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "AdminHospitalChatSession" ADD CONSTRAINT "AdminHospitalChatSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHospitalChatMessage" ADD CONSTRAINT "AdminHospitalChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdminHospitalChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
