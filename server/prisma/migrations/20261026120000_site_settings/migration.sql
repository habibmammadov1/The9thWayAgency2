-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- Initial value: the number the site should show from now on (editable later in the admin panel)
INSERT INTO "SiteSettings" ("id", "whatsappNumber", "updatedAt")
VALUES ('default', '+1 (770) 679-2620', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
