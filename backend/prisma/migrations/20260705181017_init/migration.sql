-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ucid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "blok" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WARGA',
    "deviceId" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "qrToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Mendatang',
    "proposal_url" TEXT NOT NULL DEFAULT '',
    "proposal_status" TEXT NOT NULL DEFAULT 'Menunggu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporter_ucid" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "ucid" TEXT NOT NULL,
    "jenis_iuran" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Belum Bayar',
    "bukti_transfer" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_ucid" TEXT NOT NULL,
    "actor_name" TEXT,
    "actor_role" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "details" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ucid_key" ON "User"("ucid");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporter_ucid_fkey" FOREIGN KEY ("reporter_ucid") REFERENCES "User"("ucid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_ucid_fkey" FOREIGN KEY ("ucid") REFERENCES "User"("ucid") ON DELETE CASCADE ON UPDATE CASCADE;
