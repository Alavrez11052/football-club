-- CreateEnum
CREATE TYPE "RcdmRole" AS ENUM ('EMPLOYEE', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "rcdm_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "RcdmRole" NOT NULL DEFAULT 'EMPLOYEE',
    "rank" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rcdm_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "orgName" TEXT NOT NULL DEFAULT 'Ridgeway County Disaster Management',
    "shortName" TEXT NOT NULL DEFAULT 'RCDM',
    "tagline" TEXT NOT NULL DEFAULT 'Prepared. Responsive. Community first.',
    "heroText" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "aboutText" TEXT NOT NULL DEFAULT '',
    "operationsText" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT 'Ridgeway County, Indiana',
    "footerNote" TEXT NOT NULL DEFAULT 'For life-threatening emergencies, always call 911.',

    CONSTRAINT "rcdm_site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT 'internal',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rcdm_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_operations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Planning',
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rcdm_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_assignments" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleOnOp" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Assigned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rcdm_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_training_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "completedOn" TIMESTAMP(3),
    "expiresOn" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rcdm_training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rcdm_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rcdm_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rcdm_users_email_key" ON "rcdm_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rcdm_assignments_operationId_userId_key" ON "rcdm_assignments"("operationId", "userId");

-- AddForeignKey
ALTER TABLE "rcdm_announcements" ADD CONSTRAINT "rcdm_announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "rcdm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rcdm_assignments" ADD CONSTRAINT "rcdm_assignments_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "rcdm_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rcdm_assignments" ADD CONSTRAINT "rcdm_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "rcdm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rcdm_training_records" ADD CONSTRAINT "rcdm_training_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "rcdm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

