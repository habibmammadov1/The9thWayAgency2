import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add mustChangePassword column with a default value
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser"
    ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT true
  `);
  console.log('✓ Column mustChangePassword added');

  // The existing admin created via CLI set their own real password — mark them as not needing to change
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "AdminUser"
    SET "mustChangePassword" = false
    WHERE "mustChangePassword" = true
  `);
  console.log(`✓ Existing admin accounts marked mustChangePassword=false (${updated} rows)`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
