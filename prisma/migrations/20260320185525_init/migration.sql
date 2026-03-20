-- CreateTable
CREATE TABLE "JournalDay" (
    "dateKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalDay_pkey" PRIMARY KEY ("dateKey")
);

-- CreateTable
CREATE TABLE "CustomSectionDefinitions" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "definitions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSectionDefinitions_pkey" PRIMARY KEY ("id")
);
