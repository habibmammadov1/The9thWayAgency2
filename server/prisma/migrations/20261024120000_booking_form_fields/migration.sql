-- AlterTable
ALTER TABLE "BookingTypeLocale" ADD COLUMN     "fields" JSONB;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "answers" JSONB;
