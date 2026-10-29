-- India hiring stages, one referral per application, offer comparison, and a joining date.
ALTER TYPE "ApplicationStatus" ADD VALUE 'RECRUITER_CALL';
ALTER TYPE "ApplicationStatus" ADD VALUE 'ASSESSMENT';
ALTER TYPE "ApplicationStatus" ADD VALUE 'ASSIGNMENT';
ALTER TYPE "ApplicationStatus" ADD VALUE 'HR_ROUND';
ALTER TYPE "ApplicationStatus" ADD VALUE 'NEGOTIATION';
ALTER TYPE "ApplicationStatus" ADD VALUE 'BGV';
ALTER TYPE "ApplicationStatus" ADD VALUE 'JOINED';

CREATE TYPE "ReferralStatus" AS ENUM ('NOT_ASKED', 'ASKED', 'REFERRED', 'NO_REPLY');

ALTER TABLE "Application" ADD COLUMN "joiningDate" DATE;

CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "relation" TEXT NOT NULL DEFAULT '',
    "status" "ReferralStatus" NOT NULL DEFAULT 'NOT_ASKED',
    "askedAt" TIMESTAMP(3),
    "message" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Referral_applicationId_key" ON "Referral"("applicationId");

ALTER TABLE "Referral" ADD CONSTRAINT "Referral_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "basicMonthly" INTEGER NOT NULL DEFAULT 0,
    "fixedGrossMonthly" INTEGER NOT NULL DEFAULT 0,
    "variableAnnual" INTEGER NOT NULL DEFAULT 0,
    "joiningBonus" INTEGER NOT NULL DEFAULT 0,
    "esopAnnual" INTEGER NOT NULL DEFAULT 0,
    "employeePfMonthly" INTEGER NOT NULL DEFAULT 0,
    "employerPfMonthly" INTEGER NOT NULL DEFAULT 0,
    "gratuityMonthly" INTEGER NOT NULL DEFAULT 0,
    "professionalTaxMonthly" INTEGER NOT NULL DEFAULT 0,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);
