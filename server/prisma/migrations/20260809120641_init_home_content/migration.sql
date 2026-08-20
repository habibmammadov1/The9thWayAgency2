-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "overline" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroTeamLead" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "linkLabel" TEXT NOT NULL,
    "photoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroTeamLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniquenessCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniquenessCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutStat" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutStatsContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "imageUrl" TEXT,
    "caption" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutStatsContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "connectHeading" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supportingText" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "badgeText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FooterSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroTeamLead_locale_key" ON "HeroTeamLead"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "AboutStatsContent_locale_key" ON "AboutStatsContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "FooterContent_locale_key" ON "FooterContent"("locale");
