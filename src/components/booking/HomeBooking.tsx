import BookingWidget from "@/components/booking/BookingWidget";
import type { PublicBookingType } from "@/lib/booking/types";

// Booking section of the home page. Texts are fixed here; the section hides itself
// when no active meeting type exists in this language.

const TEXTS = {
  az: { title: "Görüş təyin edin", text: "Sizə uyğun gün və saatı seçin, qalanını biz həll edək." },
  ru: { title: "Запишитесь на встречу", text: "Выберите удобные день и время, остальное мы берём на себя." },
  en: { title: "Book a meeting", text: "Pick a day and time that suits you. We take care of the rest." },
} as const;

export default function HomeBooking({ types, locale }: { types: PublicBookingType[]; locale: string }) {
  if (types.length === 0) return null;
  const t = TEXTS[locale as keyof typeof TEXTS] ?? TEXTS.az;

  return (
    <section id="booking" className="relative w-full scroll-mt-24 bg-[#F7F6F4] py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tighter text-[#0B0B0C] md:text-5xl">{t.title}</h2>
          <p className="text-lg text-[#4A4A4A]">{t.text}</p>
        </div>
        <div className="mx-auto max-w-5xl">
          <BookingWidget types={types} locale={locale} />
        </div>
      </div>
    </section>
  );
}
