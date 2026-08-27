/*
  Warnings:

  - You are about to drop the column `badgeText` on the `FooterContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FooterContent" DROP COLUMN "badgeText",
ADD COLUMN     "copyrightText" TEXT;

-- CreateTable
CREATE TABLE "ClientLogo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicesIntro" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "pillLabel" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bullets" JSONB NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseUsIntro" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "pillLabel" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseUsIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatHighlightCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaText" TEXT NOT NULL,
    "ctaLinkLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatHighlightCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseUsCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "checklistItems" JSONB NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseUsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HappyClientsCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "percentage" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "avatarUrls" JSONB NOT NULL,
    "clientCount" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HappyClientsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestimonialsSectionIntro" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestimonialsSectionIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestimonialHighlight" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "reviewCount" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestimonialHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "quote" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientRole" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "trustBadge" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHero" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "pillLabel" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT NOT NULL,
    "backgroundImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "tags" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "colorTheme" TEXT NOT NULL,
    "stat1Value" TEXT NOT NULL,
    "stat1Label" TEXT NOT NULL,
    "stat2Value" TEXT NOT NULL,
    "stat2Label" TEXT NOT NULL,
    "stat3Value" TEXT NOT NULL,
    "stat3Label" TEXT NOT NULL,
    "viewProjectLabel" TEXT NOT NULL,
    "projectLink" TEXT,
    "challenge" TEXT NOT NULL DEFAULT '',
    "approach" TEXT NOT NULL DEFAULT '',
    "result" TEXT NOT NULL DEFAULT '',
    "galleryImageUrls" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioFAQIntro" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "pillLabel" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "calloutHeading" TEXT NOT NULL,
    "calloutText" TEXT NOT NULL,
    "calloutCtaLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioFAQIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQItem" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "featuredImageUrl" TEXT,
    "categoryId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorAvatarUrl" TEXT,
    "authorBio" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioIntroContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "overline" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioIntroContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatWeBuildContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "mainImageUrl" TEXT,
    "statValue" TEXT NOT NULL,
    "statLabel" TEXT NOT NULL,
    "statAvatarUrls" JSONB NOT NULL,
    "statCaption" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatWeBuildContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatWeBuildFeature" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatWeBuildFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionVisionContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "statValue" TEXT NOT NULL,
    "statLabel" TEXT NOT NULL,
    "statAvatarUrls" JSONB NOT NULL,
    "statCaption" TEXT NOT NULL,
    "missionLabel" TEXT NOT NULL,
    "missionText" TEXT NOT NULL,
    "visionLabel" TEXT NOT NULL,
    "visionText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionVisionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationSnippet" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "value" TEXT,
    "avatarUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "photoUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamIntroContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "pillLabel" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamIntroContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTeaserSettings" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "viewAllLabel" TEXT NOT NULL,
    "displayCount" INTEGER NOT NULL DEFAULT 4,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTeaserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactWhyChooseUsContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "overline" TEXT NOT NULL,
    "chartLabel" TEXT NOT NULL,
    "chartHeading" TEXT NOT NULL,
    "chartParagraph" TEXT NOT NULL,
    "chartBarValues" JSONB NOT NULL,
    "rightHeading" TEXT NOT NULL,
    "rightParagraph" TEXT NOT NULL,
    "bandText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactWhyChooseUsContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFeatureCard" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactFeatureCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workingHours" TEXT NOT NULL,
    "mapLatitude" DOUBLE PRECISION,
    "mapLongitude" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourcePage" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationEntry" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicesIntro_locale_key" ON "ServicesIntro"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "WhyChooseUsIntro_locale_key" ON "WhyChooseUsIntro"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "StatHighlightCard_locale_key" ON "StatHighlightCard"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "WhyChooseUsCard_locale_key" ON "WhyChooseUsCard"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "HappyClientsCard_locale_key" ON "HappyClientsCard"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "SupportCard_locale_key" ON "SupportCard"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialsSectionIntro_locale_page_key" ON "TestimonialsSectionIntro"("locale", "page");

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialHighlight_locale_key" ON "TestimonialHighlight"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHero_locale_key" ON "PortfolioHero"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_locale_slug_key" ON "CaseStudy"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioFAQIntro_locale_key" ON "PortfolioFAQIntro"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_locale_slug_key" ON "BlogCategory"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_locale_slug_key" ON "BlogPost"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "StudioIntroContent_locale_key" ON "StudioIntroContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "WhatWeBuildContent_locale_key" ON "WhatWeBuildContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "MissionVisionContent_locale_key" ON "MissionVisionContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TeamIntroContent_locale_key" ON "TeamIntroContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TeamTeaserSettings_locale_page_key" ON "TeamTeaserSettings"("locale", "page");

-- CreateIndex
CREATE UNIQUE INDEX "ContactWhyChooseUsContent_locale_key" ON "ContactWhyChooseUsContent"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_locale_key" ON "ContactInfo"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationEntry_namespace_key_locale_key" ON "TranslationEntry"("namespace", "key", "locale");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
