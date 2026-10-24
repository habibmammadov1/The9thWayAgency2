// Admin guide: the single source of truth for Admin → Təlimat.
// The same data renders the page and builds the text that admins copy into an AI assistant.
// When an admin feature changes, update the matching section here.

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "steps"; title?: string; items: string[] }
  | { type: "list"; title?: string; items: string[] }
  | { type: "note"; text: string }
  | { type: "warn"; text: string };

export interface GuideSection {
  id: string;
  title: string;
  /** One sentence: what this part of the admin is for. */
  summary: string;
  blocks: GuideBlock[];
}

/** Placeholder replaced with the real site address when the text is built in the browser. */
export const ORIGIN_PLACEHOLDER = "{{SAYT}}";

export const SAMPLE_QUESTIONS = [
  "Necə forma yaradım?",
  "Yeni səhifə necə yaradım və menyuya necə əlavə edim?",
  "Formaya gələn cavabları harada görürəm?",
  "Rezervasiya (görüş) sistemini necə qururam?",
  "Kimsə görüş rezerv edəndə harada görürəm?",
  "Bloq yazısı necə əlavə edim?",
  "Yeni admin istifadəçi necə əlavə edim?",
  "Şəkil yüklənmir, nə edim?",
  "Saytda dəyişiklik görünmür, niyə?",
];

export const AI_PREAMBLE = [
  "Sən THE9THWAY Agency saytının admin panelini istifadə edən adminlərə kömək edən köməkçisən.",
  "Aşağıda bu admin panelin istifadə təlimatı var. Suallara YALNIZ bu təlimata əsasən cavab ver.",
  "Qaydalar:",
  "- Cavabı Azərbaycan dilində, sadə və addım-addım yaz (1, 2, 3...). Texniki biliyi olmayan insana izah edirsən.",
  "- Admin paneldəki menyu və düymə adlarını təlimatdakı kimi, dırnaq içində göstər (məs. \"Yadda saxla\", \"Yeni forma\").",
  "- Təlimatda olmayan bir şey soruşulsa, uydurma: \"Bu təlimatda yoxdur, saytı hazırlayan developerə müraciət edin\" de.",
  "- Sual qeyri-dəqiqdirsə, əvvəl qısa sual verib dəqiqləşdir.",
  "",
  `Saytın ünvanı: ${ORIGIN_PLACEHOLDER}    Admin panel: ${ORIGIN_PLACEHOLDER}/admin`,
].join("\n");

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "umumi",
    title: "Ümumi məlumat",
    summary: "Admin panelin quruluşu, yadda saxlama qaydası və vacib məlumatlar.",
    blocks: [
      {
        type: "p",
        text: "Sayt 3 dildədir: Azərbaycan (AZ), Rus (RU) və İngilis (EN). Ünvanlar /az, /ru və /en ilə başlayır (məs. /az/about). Admin panel saytın məzmununu kod yazmadan idarə etmək üçündür.",
      },
      {
        type: "list",
        title: "Panelin hissələri",
        items: [
          "Sol menyu: bütün bölmələr burada. \"Məzmun\" qrupunda saytın səhifə və bölmələri, \"Sistem\" qrupunda Müraciətlər, İstifadəçilər və Təlimat, \"Sayt Ayarları\" qrupunda Brendinq və Tərcümələr var. Aşağıda \"Profil\" və \"Çıxış\".",
          "Yuxarı panel: \"Saytı Gör\" düyməsi saytı yeni pəncərədə açır. \"API Qoşulu\" (yaşıl) yazısı sistemin işlədiyini göstərir. \"API Əlaqəsi Yoxdur\" (qırmızı) çıxarsa, server əlçatan deyil.",
          "Sağ yuxarıda hesabınızın adı və çıxış düyməsi var.",
        ],
      },
      {
        type: "steps",
        title: "Yadda saxlama qaydası",
        items: [
          "Dəyişikliyi edin (mətn yazın, şəkil yükləyin, sıranı dəyişin).",
          "Mütləq \"Yadda saxla\" (və ya \"Dəyişiklikləri Yadda Saxla\") düyməsini basın. Basmasanız, səhifədən çıxanda dəyişiklik itir.",
          "\"Yadda saxlanıldı\" bildirişini gözləyin. Dəyişiklik saytda dərhal görünür.",
          "Saytda görünmürsə, saytı brauzerdə Ctrl+F5 ilə yeniləyin.",
        ],
      },
      {
        type: "list",
        title: "Şəkillər",
        items: [
          "Formatlar: JPG, PNG, WEBP, SVG. Maksimum ölçü: 5 MB.",
          "Şəkli yükləmə sahəsinə sürükləyib buraxın və ya sahəyə basıb fayl seçin.",
        ],
      },
      {
        type: "warn",
        text: "Admin panelin ilk səhifəsindəki (Ana panel) rəqəmlər və \"Son fəaliyyət\" siyahısı nümunə məlumatdır, real statistika deyil. Sol menyudakı \"Naviqasiya\" və \"Ümumi\" bəndləri hələ hazır deyil (açılmır). Saytın yuxarı menyusuna səhifə əlavə etmək üçün \"Səhifələr\" bölməsində \"Menyuda göstər\" ayarından istifadə edin.",
      },
    ],
  },
  {
    id: "giris",
    title: "Daxil olmaq, şifrə və çıxış",
    summary: "Admin panelə giriş, ilk giriş zamanı şifrə dəyişmək və çıxış.",
    blocks: [
      {
        type: "steps",
        title: "Daxil olmaq",
        items: [
          "{{SAYT}}/admin ünvanını açın.",
          "E-poçt və şifrənizi yazıb \"Daxil Ol\" düyməsini basın.",
          "Sessiyanız bitərsə, panel sizi yenidən giriş səhifəsinə yönləndirir. Sadəcə yenidən daxil olun.",
        ],
      },
      {
        type: "p",
        text: "Hesabınızı sizə admin müvəqqəti şifrə ilə yaradıbsa, ilk girişdə \"Yeni Şifrə Təyin Edin\" səhifəsi açılır. Öz şifrənizi təyin etmədən panelin başqa hissələrinə keçmək olmur.",
      },
      {
        type: "note",
        text: "Çıxmaq üçün sol altda \"Çıxış\" düyməsini və ya yuxarı sağdakı çıxış ikonunu basın. Şifrəni heç kimlə paylaşmayın.",
      },
    ],
  },
  {
    id: "sehifeler",
    title: "Səhifələr (yeni səhifə yaratmaq)",
    summary: "Admin → Səhifələr: blokları seçib yeni səhifə qurmaq, 3 dildə doldurmaq, dərc etmək.",
    blocks: [
      {
        type: "p",
        text: "Səhifələr bölməsi hazır bloklardan yeni səhifə qurmaq üçündür (kampaniya, xidmət detalı, karyera və s.). Saytın mövcud səhifələri (Ana səhifə, Haqqımızda və s.) ayrıca bölmələrdən idarə olunur. Yeni səhifə /az/URL, /ru/URL, /en/URL ünvanında açılır.",
      },
      {
        type: "steps",
        title: "Yeni səhifə yaratmaq",
        items: [
          "Sol menyuda \"Səhifələr\" → \"Yeni səhifə\".",
          "Başlıq yazın. URL başlıqdan avtomatik yaranır, istəsəniz dəyişin.",
          "İlk dili seçin və şablon seçin: \"Boş səhifə\", \"Landing\", \"Xidmət detalı\" və ya \"Kampaniya\".",
          "\"Yarat\" basın. Səhifə qaralama kimi yaranır və saytda hələ görünmür. Redaktor açılır.",
        ],
      },
      {
        type: "steps",
        title: "Blok əlavə etmək və redaktə etmək",
        items: [
          "Redaktorda \"Blok əlavə et\" düyməsini basın, blok seçin.",
          "Blokun başlığına basıb formasını açın, mətnləri, şəkilləri və düymələri doldurun.",
          "Blokların yerini dəyişmək üçün sol tərəfdəki tutacaqdan (6 nöqtə) tutub sürükləyin.",
          "Blokda göz ikonu bloku silmədən gizlədir, kopyala ikonu blokun kopyasını yaradır, zibil qutusu silir.",
          "Sağ tərəfdə canlı önizləmə var (kompüter və mobil görünüş). \"Yadda saxla\" basın.",
        ],
      },
      {
        type: "list",
        title: "Mövcud bloklar",
        items: [
          "Hero: böyük başlıq, mətn, fon şəkli, 0-2 düymə. Görünüşü: Tam şəkil, Bölünmüş, Yalnız mətn.",
          "Mətn: başlıqlar, paraqraflar, siyahılar, sitat, link, şəkil.",
          "Şəkil + Mətn: yan-yana şəkil və mətn (şəkil solda/sağda, nisbət 50/50 və ya 40/60).",
          "Kartlar: istənilən sayda kart. Sütun sayı 2/3/4, mobildə 1 və ya 2. Stil: Sadə, Çərçivəli, Şəkilli, Rəqəm (statistika). Hər kartda ikon və ya şəkil, başlıq, mətn, link. Kartları \"Kart əlavə et\" ilə artırın, sürükləyib sıralayın.",
          "Qalereya: şəkillər (Grid və ya Slider).",
          "FAQ: sual-cavab siyahısı.",
          "CTA band: başlıq, mətn və bir düymə.",
          "Rəylər, Müştəri loqoları, Komanda: mövcud bölmələri səhifəyə qoyur. Məzmunu öz bölmələrində dəyişirsiniz (Rəylər, Müştəri Loqoları, Komanda).",
          "Əlaqə forması: saytın köhnə, sabit əlaqə formasını göstərir (cavablar \"Müraciətlər\" bölməsinə düşür).",
          "Forma: \"Formalar\" bölməsində qurduğunuz formanı göstərir (aşağıda ayrıca izah olunub).",
          "Rezervasiya: ziyarətçinin təqvimdən gün və saat seçib görüş rezerv etdiyi bölmə (\"Rezervasiyalar\" bölməsində izah olunub).",
        ],
      },
      {
        type: "list",
        title: "Hər blokun görünüş ayarları (blokun altında)",
        items: [
          "Fon: Tünd, Açıq, Ağ, Qızılı.",
          "Boşluq: S, M, L (yuxarı-aşağı məsafə).",
          "Hizalama: Sol və ya Mərkəz.",
          "Anchor id: istəyə görə. Linkdə #ad yazaraq səhifədə bu bloka keçid etmək olur.",
        ],
      },
      {
        type: "steps",
        title: "Dillər",
        items: [
          "Redaktorun yuxarısında AZ / RU / EN tab-ları var. Hər dilin öz başlığı və öz blokları var. Yaşıl nöqtə o dildə başlıq olduğunu göstərir.",
          "Boş dilə keçəndə \"AZ versiyasını kopyala\" təklifi çıxır. Basın, sonra mətnləri tərcümə edin.",
          "Başlığı boş olan dil saytda göstərilmir (həmin ünvan 404 verir).",
        ],
      },
      {
        type: "steps",
        title: "Ayarlar / SEO tab-ı",
        items: [
          "URL (slug): yalnız kiçik latın hərfləri, rəqəmlər və \"-\" ola bilər. about, services, portfolio, blogs, team, contact, admin, api kimi mövcud ünvanları istifadə etmək olmaz.",
          "\"Menyuda göstər\" açarı: səhifə dərc olunanda saytın yuxarı menyusunda link görünür. \"Menyuda sıra\" kiçik rəqəm əvvəl göstərilir. \"Menyu adı\" boş qalsa, səhifə başlığı yazılır (qısa ad seçin).",
          "SEO başlıq və SEO təsvir (təxminən 160 simvol): Google-da görünən mətn. \"Paylaşım şəkli\" (tövsiyə 1200x630) WhatsApp, Facebook-da görünür. Bunlar hər dil üçün ayrıca doldurulur.",
        ],
      },
      {
        type: "steps",
        title: "Dərc etmək və gizlətmək",
        items: [
          "Hazır olanda \"Dərc et\" basın. Yoxlama pəncərəsi çıxır: qırmızı xəta dərci dayandırır, sarı xəbərdarlıq (məs. RU dili boşdur, SEO təsviri yoxdur) mane olmur.",
          "Təsdiq etdikdən sonra status \"● Canlı\" olur. \"Saytda bax\" ilə yoxlayın.",
          "Canlı səhifədə \"Yadda saxla\" dəyişikliyi dərhal saytda göstərir.",
          "Səhifəni saytdan götürmək üçün \"Dərcdən çıxar\" basın. Məzmun silinmir, qaralama kimi qalır.",
          "Səhifələr siyahısında kopyalamaq (oxşar səhifə üçün) və silmək (geri qaytarılmır) də mümkündür.",
        ],
      },
    ],
  },
  {
    id: "formalar",
    title: "Formalar (öz sahələrinizlə forma yaratmaq)",
    summary: "Admin → Formalar: formanı sahələri ilə qurmaq, səhifəyə qoşmaq, cavabları görmək.",
    blocks: [
      {
        type: "p",
        text: "Formalar bölməsində siz özünüz forma qurursunuz: istədiyiniz sahəni əlavə edir, silir, sırasını dəyişir, məcburi edirsiniz. Bir neçə fərqli forma yarada bilərsiniz (məs. \"Kampaniya forması\", \"Karyera forması\") və hər birinin cavabları ayrıca görünür. Cavablar yalnız admin paneldə görünür, e-poçtla göndərilmir.",
      },
      {
        type: "steps",
        title: "Necə forma yaradım",
        items: [
          "Sol menyuda \"Formalar\" → \"Yeni forma\".",
          "Forma adını yazın (yalnız siz görürsünüz, məs. \"Kampaniya forması\") və \"Yarat\" basın. Redaktor açılır.",
          "Yuxarıda AZ tab-ı seçili olsun. Başlamaq üçün \"Ad, e-poçt, mesaj ilə başla\" düyməsini basın (hazır sahələr gəlir) və ya \"+ Sahə əlavə et\" ilə özünüz əlavə edin.",
          "Sahənin başlığına basıb formasını açın və doldurun (aşağıya baxın).",
          "Aşağıda \"Göndər düyməsinin mətni\", \"Uğur başlığı\" və \"Uğur mətni\" yazın (ziyarətçi göndərəndə görəcəyi təşəkkür mesajı).",
          "Sağdakı önizləmədə formanın görünüşünü yoxlayın.",
          "\"Yadda saxla\" basın.",
          "Forma hələ saytda görünmür: onu səhifəyə qoşmaq lazımdır (növbəti başlıq).",
        ],
      },
      {
        type: "list",
        title: "Sahə növləri",
        items: [
          "Qısa mətn (ad, şirkət adı), Uzun mətn (mesaj).",
          "E-poçt (format yoxlanılır), Telefon, Tarix.",
          "Açılan siyahı (bir variant seçilir), Bir seçim (radio), Çoxlu seçim (bir neçə variant seçilir).",
          "Təsdiq xanası (məs. \"Şərtlərlə razıyam\").",
        ],
      },
      {
        type: "list",
        title: "Hər sahədə nə dəyişə bilərsiniz",
        items: [
          "Sahə növü, Başlıq, Nümunə mətn (placeholder), Köməkçi mətn.",
          "\"Məcburi sahə\" açarı: açıqdırsa, ziyarətçi doldurmadan göndərə bilməz.",
          "Açılan siyahı, radio və çoxlu seçimdə \"Variantlar\" xanası: hər sətirdə bir variant yazın (məs. SMM, Dizayn, Veb sayt).",
          "Sahəni sürükləyib sırasını dəyişin, kopyalayın və ya silin. Bir formada ən çox 30 sahə ola bilər.",
        ],
      },
      {
        type: "steps",
        title: "Hər dil üçün ayrıca forma",
        items: [
          "AZ / RU / EN tab-ları var. Hər dilin öz sahələri və mətnləri var, yəni dillərə görə fərqli sahələr də ola bilər.",
          "RU və ya EN tab-ına keçin. Boşdursa \"AZ versiyasını kopyala\" düyməsi çıxır. Basın, sonra başlıqları və mətnləri tərcümə edin.",
          "Sahəsi olmayan dil saytda göstərilmir.",
        ],
      },
      {
        type: "steps",
        title: "Formanı saytdakı səhifəyə qoşmaq",
        items: [
          "\"Səhifələr\" bölməsində səhifəni açın (və ya yeni səhifə yaradın).",
          "\"Blok əlavə et\" → \"Forma\" (\"Hazır bölmələr\" qrupunda).",
          "Blokun içində \"Forma\" açılan siyahısından formanı seçin. İstəsəniz başlıq və alt mətn yazın.",
          "\"Yadda saxla\", sonra səhifə dərc olunmayıbsa \"Dərc et\".",
          "Saytda səhifəni açıb formanı yoxlayın. Eyni formanı bir neçə səhifədə istifadə etmək olar.",
        ],
      },
      {
        type: "steps",
        title: "Cavabları görmək",
        items: [
          "\"Formalar\" → formanın adına basın → \"Cavablar\" tab-ı. Siyahıda formanın yanında cavab sayı və \"yeni\" nişanı da görünür.",
          "Üstündəki süzgəclə seçin: Hamısı, Yeni, Oxunub, Arxiv.",
          "Cavabın sətrinə basın: bütün cavab açılır (hər sahə: başlıq və cavab).",
          "Pəncərədə \"Oxunub\", \"Yeni kimi işarələ\", \"Arxivlə\" və \"Sil\" düymələri var. Açdığınız yeni cavab avtomatik \"Oxunub\" olur.",
          "Yeni cavab gələndə sol menyuda \"Formalar\"ın yanında say görünür.",
        ],
      },
      {
        type: "warn",
        text: "Cavabı olan formanı silmək olmur (cavablar itməsin deyə). Formanı saytdan götürmək üçün formanın redaktorunda yuxarıdakı \"Aktiv\" açarını söndürüb \"Yadda saxla\" basın. Deaktiv forma saytda göstərilmir, cavablar qalır. Tək bir cavabı silmək (məsələn şəxsi məlumatı silmək üçün) \"Cavablar\"da mümkündür.",
      },
      {
        type: "list",
        title: "Bilmək faydalıdır",
        items: [
          "Sahənin adını sonradan dəyişsəniz, köhnə cavablar köhnə adla qalır.",
          "Fayl yükləmə sahəsi yoxdur.",
          "Spam qorunması: gizli sahə və eyni ünvandan saatda ən çox 10 göndəriş limiti var.",
          "Bu bölmə saytdakı köhnə sabit əlaqə formasından ayrıdır. Köhnə formanın mesajları \"Müraciətlər\" bölməsindədir.",
        ],
      },
    ],
  },
  {
    id: "rezervasiyalar",
    title: "Rezervasiyalar (görüş təyin etmək sistemi)",
    summary: "Admin → Rezervasiyalar: iş cədvəli, görüş növləri, bağlı vaxtlar, gələn rezervasiyalar, saytda rezervasiya bloku.",
    blocks: [
      {
        type: "p",
        text: "Bu sistem Calendly kimi işləyir: ziyarətçi saytda təqvimdən gün seçir, o günün boş saatlarını görür, saat seçib adını və e-poçtunu yazır və görüş rezerv olunur. Bütün görüşlər bir ümumi təqvimdədir: biri rezerv olunanda həmin vaxt bütün görüş növləri üçün bağlanır. Rezervasiyalar yalnız admin paneldə görünür, e-poçt göndərilmir. Ziyarətçi təsdiqi ekranda görür və \"Təqvimə əlavə et\" ilə .ics faylı yükləyə bilər.",
      },
      {
        type: "steps",
        title: "Sistemi ilk dəfə qurmaq",
        items: [
          "Sol menyuda \"Rezervasiyalar\" → \"İş cədvəli\" tab-ı. Biznes saat qurşağını seçin (məs. Asia/Baku) və hər gün üçün iş saatlarını yazın. Bağlı gün üçün bütün aralıqları silin. Bir gündə fasilə üçün 2 aralıq əlavə etmək olar (məs. 09:00-13:00 və 14:00-18:00). \"Yadda saxla\".",
          "\"Görüş növləri\" tab-ı → \"Yeni görüş növü\". Daxili ad (yalnız siz görürsünüz), müddət (dəqiqə) yazın. Hər dil (AZ/RU/EN) üçün başlıq, təsvir, görüş yeri/linki və təşəkkür mətni yazın. Başlığı boş qoyduğunuz dildə AZ mətn göstərilir (heç bir dildə başlıq yoxdursa növ saytda görünməz). \"Saxla\".",
          "\"Səhifələr\" bölməsində istədiyiniz səhifəni açın → \"Blok əlavə et\" → \"Rezervasiya\" (\"Hazır bölmələr\" qrupunda). \"Görüş növü\" siyahısından növü seçin (boş buraxsanız, ziyarətçi özü seçir). İstəsəniz başlıq və alt mətn yazın.",
          "Səhifəni \"Yadda saxla\" və \"Dərc et\", sonra saytda açıb rezerv edərək yoxlayın.",
        ],
      },
      {
        type: "list",
        title: "Ana səhifədə və menyuda",
        items: [
          "Ana səhifədə, Komanda ilə Əlaqə bölmələrinin arasında, \"Görüş təyin edin\" bölməsi avtomatik görünür. Onu əlavə etmək lazım deyil: ən azı bir aktiv görüş növü olan kimi görünür, olmayanda gizlənir.",
          "Yuxarı menyudakı və mobil menyudakı \"Konsultasiya al\" düyməsi ana səhifədəki bu bölməyə aparır. Aktiv görüş növü yoxdursa, düymə \"Əlaqə\" səhifəsinə aparır.",
          "Bu bölmənin başlığı və alt mətni sabitdir, paneldən dəyişmir. Fərqli mətnlə ayrıca yer istəsəniz, \"Səhifələr\"də yeni səhifə yaradıb \"Rezervasiya\" blokunu qoyun.",
          "Görüş növünün özünün mətnləri (başlıq, təsvir, görüş yeri, təşəkkür) \"Görüş növləri\" tab-ında dəyişir.",
        ],
      },
      {
        type: "steps",
        title: "Rezervasiya formunun sahələrini qurmaq (məsələn Clinic name, Website)",
        items: [
          "\"Rezervasiyalar\" → \"Görüş növləri\" → növün qələm ikonuna basın. Pəncərənin aşağısında \"Rezervasiya formunun sahələri\" bölməsi var.",
          "Ad və E-poçt həmişə var və məcburidir, onları silmək olmur. Qalan sahələri siz qurursunuz: \"Sahə əlavə et\" basın, sahəyə basıb açın, növünü seçin (qısa mətn, uzun mətn, e-poçt, telefon, açılan siyahı və s.), başlıq yazın (məsələn \"Clinic name\"), \"Məcburi\" açarı ilə məcburi edin.",
          "Sahələri sürükləyib sıralaya, kopyalaya və silə bilərsiniz. Yeni növdə başlanğıc üçün Telefon və Qeyd sahələri gəlir, istəsəniz silin.",
          "Hər dil (AZ, RU, EN) üçün sahələr ayrıca qurulur. Başqa dil tab-ında \"AZ-dan kopyala\" mətnləri və sahələri birlikdə kopyalayır. Bir dildə başlıq yoxdursa, orada AZ versiyası (mətn və sahələri ilə) göstərilir.",
          "\"Saxla\" basın. Saytda tarix və saat seçəndən sonra forma bu sahələrlə açılır.",
          "Ziyarətçinin cavabları \"Rezervasiyalar\" tab-ında rezervasiyaya basanda görünür. Sahənin başlığını sonradan dəyişsəniz, köhnə rezervasiyalar köhnə başlıqla qalır.",
        ],
      },
      {
        type: "list",
        title: "İş cədvəlinin ayarları",
        items: [
          "Saatların addımı: saatlar nə qədər aralıqla təklif olunur (15, 30, 45 və ya 60 dəqiqə).",
          "Görüşlər arası fasilə: hər görüşdən əvvəl və sonra boş qalan dəqiqə sayı.",
          "Minimum xəbərdarlıq: ziyarətçi ən tez neçə saat sonraya rezerv edə bilər (məs. 12 saat).",
          "Ən çox neçə gün irəli: təqvim bugündən neçə gün sonraya qədər açıqdır.",
          "Ziyarətçi saatları öz saat qurşağında görür, siz isə admin paneldə biznes qurşağında.",
        ],
      },
      {
        type: "steps",
        title: "Gələn rezervasiyaları görmək",
        items: [
          "\"Rezervasiyalar\" → \"Rezervasiyalar\" tab-ı. Süzgəc: Gələcək, Keçmiş, Ləğv edilmiş.",
          "Sətrə basın: ad, e-poçt, telefon, mesaj, ziyarətçinin saat qurşağı açılır. Orada yalnız sizə görünən qeyd yaza bilərsiniz.",
          "\"Ləğv et\": rezervasiya ləğv olunur və həmin vaxt yenidən boş görünür (ziyarətçiyə bildiriş getmir, özünüz əlaqə saxlayın). \"Bərpa et\" ləğvi geri qaytarır (vaxt artıq tutulubsa bərpa olunmur).",
          "\"Sil\": rezervasiyanı və ziyarətçinin şəxsi məlumatını həmişəlik silir.",
          "Yeni rezervasiya gələndə sol menyuda \"Rezervasiyalar\"ın yanında say görünür.",
        ],
      },
      {
        type: "steps",
        title: "Vaxtı bağlamaq (tətil, məşğulluq)",
        items: [
          "\"Rezervasiyalar\" → \"Bağlı vaxtlar\" tab-ı.",
          "Başlanğıc və son tarix-saatı seçin, istəsəniz səbəb yazın, \"Bağla\" basın.",
          "Bu aralıqda saytda boş saat görünmür. Əvvəlcədən edilmiş rezervasiyalar silinmir, onları \"Rezervasiyalar\"da ayrıca ləğv edin.",
        ],
      },
      {
        type: "warn",
        text: "Rezervasiyası olan görüş növünü silmək olmur. Əvəzinə növün redaktorunda \"Aktiv\" açarını söndürün: növ saytda göstərilməz, rezervasiyalar qalır. İş cədvəlini dəyişdikdə artıq edilmiş rezervasiyalar dəyişmir.",
      },
      {
        type: "list",
        title: "Bilmək faydalıdır",
        items: [
          "Eyni vaxta iki nəfər rezerv edə bilməz: sistem rezerv anında yenidən yoxlayır, ikinci şəxs \"Bu vaxt artıq tutulub\" mesajı alır.",
          "Spam qorunması: gizli sahə və eyni ünvandan saatda ən çox 5 rezervasiya limiti var.",
          "Hələlik avtomatik e-poçt (təsdiq, xatırlatma), ziyarətçinin özünün ləğvi və Google Calendar sinxronu yoxdur.",
          "Görüş yeri/linki (məs. Google Meet) yalnız rezervasiya təsdiqindən sonra ziyarətçiyə göstərilir.",
        ],
      },
    ],
  },
  {
    id: "ana-sehife",
    title: "Ana Səhifə",
    summary: "Admin → Ana Səhifə: saytın ana səhifəsinin bölmələrini dəyişmək.",
    blocks: [
      {
        type: "steps",
        items: [
          "\"Ana Səhifə\" bölməsini açın. Yuxarıda AZ / RU / EN dil tab-ları var, hər dil ayrıca doldurulur.",
          "Bölmələr açılan siyahı kimidir. Dəyişmək istədiyinizin başlığına basın.",
          "Sahələri dəyişin və aşağıdakı \"Dəyişiklikləri Yadda Saxla\" düyməsini basın.",
        ],
      },
      {
        type: "list",
        title: "Bölmələr",
        items: [
          "\"Header (Hero) Bölməsi\": ana səhifənin yuxarısındakı slaydlar. \"Slayd Əlavə Et\" ilə slayd artırın (üst yazı, başlıq, təsvir, şəkil).",
          "\"Xüsusiyyətlər (Uniqueness) Bölməsi\": ikonlu/şəkilli kartlar.",
          "\"Haqqımızda və Statistikalar (About Stats)\": başlıq, mətn, şəkil və rəqəmlər.",
          "\"Aşağı Hissə (Footer)\": saytın ən aşağısındakı əlaqə başlığı, e-poçt, düymə mətni, sosial şəbəkə linkləri, müəllif hüququ mətni.",
        ],
      },
    ],
  },
  {
    id: "xidmetler",
    title: "Xidmətlər",
    summary: "Admin → Xidmətlər: xidmətlər səhifəsinin məzmunu.",
    blocks: [
      {
        type: "list",
        items: [
          "\"Xidmətlər Bölməsi Başlığı\": səhifənin başlığı və giriş mətni.",
          "\"Xidmətlər Siyahısı\": hər xidmət (ikon, başlıq, təsvir, maddələr, şəkil). Əlavə etmək, silmək və sıralamaq olur.",
          "\"Niyə Bizi Seçməlisiniz\" bölməsi: başlıq, mətn və siyahı/kartlar.",
          "Dil tab-ları ilə hər dili ayrıca doldurun və \"Yadda saxla\" basın.",
        ],
      },
    ],
  },
  {
    id: "reyler",
    title: "Rəylər",
    summary: "Admin → Rəylər: müştəri rəyləri və reytinq kartı.",
    blocks: [
      {
        type: "list",
        items: [
          "\"Rəylər Bölməsi Başlığı\": bölmənin başlığı (səhifəyə görə ayrıca ola bilər).",
          "\"Reytinq Kartı\": ümumi reytinq, rəy sayı və qısa mətn.",
          "\"Müştəri Rəyləri Siyahısı\": hər rəy (mətn, müştəri adı, vəzifəsi, avatar). Əlavə etmək, silmək və sıralamaq olur.",
          "Dəyişiklik edən kimi \"Yadda saxla\" basın. Eyni rəylər səhifə qurucusundakı \"Rəylər\" blokunda da göstərilir.",
        ],
      },
    ],
  },
  {
    id: "bloqlar",
    title: "Bloqlar",
    summary: "Admin → Bloqlar: məqalələr yazmaq, kateqoriyalar, dərc etmək.",
    blocks: [
      {
        type: "steps",
        title: "Yeni bloq yazısı",
        items: [
          "\"Bloqlar\" bölməsində dil seçin (hər dilin yazıları ayrıdır) və yeni yazı əlavə etmə düyməsini basın.",
          "\"Başlıq\" yazın. \"Slaq / Slug (URL yolu)\" başlıqdan yaranır, dəyişə bilərsiniz.",
          "\"Qısa Məzmun (Excerpt)\": siyahıda və paylaşımda görünən qısa mətn.",
          "\"Məqalə Mətni\": redaktorun alətləri: qalın, kursiv, başlıq (H2, H3), sitat, link və şəkil əlavə etmək.",
          "\"Məqalə Ayarları\": Kateqoriya, Dərc Tarixi, Status, Kaver Şəkli.",
          "\"Müəllif Məlumatları\": ad, qısa bio, avatar.",
          "Statusu seçib yazını yadda saxlayın.",
        ],
      },
      {
        type: "list",
        title: "Siyahı və kateqoriyalar",
        items: [
          "Siyahıda şəkil, başlıq, kateqoriya, müəllif, tarix və status görünür. Statusu \"Aktiv\" (saytda görünür) və \"Qaralama\" (görünmür) arasında açarla dəyişə bilərsiniz.",
          "Redaktə və silmə (silmə təsdiq tələb edir, geri qaytarılmır) əməliyyatlar sütunundadır.",
          "\"Kateqoriya Redaktoru\" ilə kateqoriyaları əlavə edib redaktə edin.",
        ],
      },
    ],
  },
  {
    id: "haqqimizda",
    title: "Haqqımızda",
    summary: "Admin → Haqqımızda: səhifənin üç hissəsi.",
    blocks: [
      {
        type: "list",
        items: [
          "Studiya tanıtımı: üst yazı, başlıq, mətn və iki şəkil.",
          "\"Nə qururuq\" hissəsi: şəkil, rəqəm, başlıq, mətn və ikonlu xüsusiyyətlər siyahısı, düymə mətni.",
          "Missiya və Vizyon: missiya/vizyon mətnləri, avatarlı statistika və qısa sitat/statistika lentləri (\"Sitat\" və \"Statistika\" növündə).",
          "Dil tab-ları ilə hər dili doldurub \"Yadda saxla\" basın.",
        ],
      },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    summary: "Admin → Portfolio: layihələr (case study), FAQ və s.",
    blocks: [
      {
        type: "list",
        items: [
          "\"Hero Bölməsi\": portfolio səhifəsinin yuxarısı (başlıq, mətn, düymələr, fon şəkli).",
          "\"Case Study-lər\": layihə kartları (başlıq, URL yolu, teqlər, 3 statistika, rəng teması, layihə linki, çətinlik/yanaşma/nəticə mətnləri, şəkillər). Layihələr əlavə, silmə və sıralamaq olur.",
          "\"Rəylər Bölməsi Başlığı\": rəylər hissəsinin başlığı.",
          "\"FAQ Bölməsi\": sual-cavab siyahısı.",
          "Hər dil ayrıca doldurulur. \"Yadda saxla\" basın.",
        ],
      },
    ],
  },
  {
    id: "komanda",
    title: "Komanda",
    summary: "Admin → Komanda: komanda üzvləri və komanda bölməsinin mətnləri.",
    blocks: [
      {
        type: "list",
        items: [
          "\"Üzvlər siyahısı\": hər üzv üçün şəkil, ad-soyad, vəzifə, şöbə (istəyə görə), LinkedIn və Instagram linki. Üzvü aktiv/deaktiv etmək olur (deaktiv üzv saytda görünmür).",
          "Üzvlərin sırasını sürükləyərək dəyişin.",
          "Giriş mətni: üst yazı, başlıq, açıqlama (komanda səhifəsi üçün).",
          "\"Teaser\" ayarları: ana səhifədə və Haqqımızda-da görünən komanda hissəsinin başlığı, \"View All\" düyməsinin yazısı və göstəriləcək kart sayı.",
          "Dil tab-ları ilə hər dili ayrıca doldurun və \"Yadda saxla\" basın.",
        ],
      },
    ],
  },
  {
    id: "loqolar",
    title: "Müştəri Loqoları",
    summary: "Admin → Müştəri Loqoları: ana səhifədəki hərəkətli brend lenti.",
    blocks: [
      {
        type: "steps",
        items: [
          "\"Loqo Əlavə Et\" basın.",
          "\"Şirkət Adı\" yazın və \"Loqo (Şəkil)\" yükləyin.",
          "Loqonu aktiv/deaktiv etmək üçün açar var (deaktiv loqo saytda görünmür).",
          "Sırasını sürükləyib dəyişin. Silmək təsdiq tələb edir və geri qaytarılmır.",
        ],
      },
    ],
  },
  {
    id: "elaqe",
    title: "Əlaqə",
    summary: "Admin → Əlaqə: əlaqə məlumatları, sosial linklər, əlaqə səhifəsinin mətnləri.",
    blocks: [
      {
        type: "list",
        items: [
          "Əlaqə məlumatları: \"Fiziki Ünvan\", \"Telefon Nömrəsi\", \"E-poçt Ünvanı\", \"İş Saatları\".",
          "\"Xəritə Koordinatları\": xəritədə ofisin yerini seçin və ya ünvanı axtarın.",
          "\"Sosial linklər\": platforma adı və link. Footer və əlaqə bölmələrində görünür.",
          "Əlaqə səhifəsinin \"Niyə biz\" hissəsi: üst yazı, diaqram etiketi və başlığı, diaqramın 5 sütun dəyəri (0-100 arası, vergüllə ayrılmış), sağ tərəf başlığı və mətni, alt hərəkətli lent mətni.",
          "\"Kartlar siyahısı\": ikon adı, başlıq, açıqlama. Sürükləyib sıralayın.",
          "\"Yadda saxla\" basın.",
        ],
      },
      {
        type: "note",
        text: "Saytdakı sabit əlaqə formasına gələn mesajlar \"Müraciətlər\" bölməsində görünür.",
      },
    ],
  },
  {
    id: "muracietler",
    title: "Müraciətlər (köhnə əlaqə formasından)",
    summary: "Admin → Müraciətlər: saytdakı sabit əlaqə formasından gələn mesajlar.",
    blocks: [
      {
        type: "list",
        items: [
          "Saytın ana səhifəsindəki və əlaqə səhifəsindəki sabit formadan gələn mesajlar buradadır (ad, e-poçt, telefon, mesaj).",
          "Statuslar: Yeni, Oxunub, Arxiv. Sətrə basanda tam mesaj açılır və \"Yeni\" mesaj avtomatik \"Oxunub\" olur. Yan menyuda yeni mesaj sayı görünür.",
          "Cavab vermək üçün mesajdakı e-poçt və ya telefon ünvanından istifadə edin.",
        ],
      },
      {
        type: "note",
        text: "\"Formalar\" bölməsində qurduğunuz formaların cavabları buraya yox, \"Formalar\" → həmin forma → \"Cavablar\" bölməsinə düşür.",
      },
    ],
  },
  {
    id: "istifadeciler",
    title: "İstifadəçilər (adminlər)",
    summary: "Admin → İstifadəçilər: admin panelə giriş hüququ olan insanlar.",
    blocks: [
      {
        type: "steps",
        title: "Yeni admin əlavə etmək",
        items: [
          "\"İstifadəçilər\" → \"Yeni İstifadəçi\".",
          "\"Ad və Soyad\", \"E-poçt\" yazın, rolu seçin (Admin), \"Müvəqqəti Şifrə\" təyin edin.",
          "Yaratdıqdan sonra e-poçtu və müvəqqəti şifrəni həmin adama təhlükəsiz yolla verin. O, ilk girişdə öz şifrəsini təyin edəcək.",
        ],
      },
      {
        type: "list",
        title: "Mövcud istifadəçi ilə",
        items: [
          "Redaktə: ad, e-poçt, rol. \"Aktiv Hesab\" açarını söndürsəniz, istifadəçi sistemə girə bilməz (hesabı silmədən).",
          "Redaktə pəncərəsində istifadəçi üçün yeni müvəqqəti şifrə yaratmaq olur (şifrəsini unudanlar üçün).",
          "Silmək təsdiq tələb edir: \"Bəli, Sil\".",
          "Siyahıda hər istifadəçinin statusu və son giriş vaxtı görünür.",
        ],
      },
    ],
  },
  {
    id: "brendinq",
    title: "Brendinq (loqo)",
    summary: "Admin → Brendinq: saytın əsas loqosu.",
    blocks: [
      {
        type: "steps",
        items: [
          "\"Brendinq\" bölməsini açın. \"Əsas Loqo\" hissəsində hazırkı loqo açıq və tünd fonda önizlənir.",
          "\"Yeni Loqo Yüklə\" ilə yeni loqo yükləyin (şəffaf fonlu PNG və ya SVG daha yaxşıdır).",
          "Saxlayın və saytda yoxlayın.",
        ],
      },
    ],
  },
  {
    id: "tercumeler",
    title: "Tərcümələr",
    summary: "Admin → Tərcümələr: saytın sabit mətnlərini (düymələr, menyu adları) dəyişmək.",
    blocks: [
      {
        type: "steps",
        items: [
          "\"Tərcümələr\" bölməsini açın. Siyahıda saytın sabit mətnləri hər dil üçün görünür.",
          "Yuxarıdakı axtarışa açar söz və ya mətnin özündən bir hissə yazıb tapın.",
          "Mətni dəyişin və yadda saxlayın. \"Son dəyişiklik\" sütunu nə vaxt dəyişdiyini göstərir.",
        ],
      },
      {
        type: "note",
        text: "Yalnız mətni (dəyəri) dəyişin. Açar adlarını dəyişməyin, yoxsa saytda həmin mətn itə bilər.",
      },
    ],
  },
  {
    id: "problemler",
    title: "Problemlər və həlləri",
    summary: "Ən çox rast gəlinən suallar.",
    blocks: [
      {
        type: "list",
        items: [
          "Dəyişiklik saytda görünmür: \"Yadda saxla\" basdınızmı? \"Yadda saxlanıldı\" bildirişi çıxdımı? Düzgün dilə (AZ/RU/EN) baxırsınız? Saytı Ctrl+F5 ilə yeniləyin.",
          "\"API Əlaqəsi Yoxdur\" (qırmızı) yazılıb: server müvəqqəti əlçatan deyil. Bir neçə dəqiqə sonra yenidən cəhd edin. Davam edərsə, developerə bildirin.",
          "Şəkil yüklənmir: format JPG, PNG, WEBP və ya SVG olmalı, ölçüsü 5 MB-dan az olmalıdır.",
          "Yeni səhifə saytda 404 verir: səhifə \"Dərc et\" ilə dərc olunub? Həmin dildə (məs. RU) başlıq və ən azı bir görünən blok var? Ünvan düzgündür (/az/URL)?",
          "Forma saytda görünmür: forma \"Aktiv\"dirmi? Həmin dildə sahə var? Səhifədəki \"Forma\" blokunda forma seçilib? Səhifə dərc olunub?",
          "Forma göndərilmir: məcburi sahələr doldurulub? Eyni ünvandan saatda 10-dan çox göndəriş edilibsə, bir müddət gözləmək lazımdır.",
          "Formanı silmək olmur: cavabları var. Formanı \"Aktiv\" açarı ilə deaktiv edin.",
          "Yaratdığım səhifənin URL-i qəbul olunmur: yalnız kiçik latın hərfləri, rəqəmlər və \"-\" olmalıdır, about, blogs kimi mövcud ünvanlar olmaz, başqa səhifə ilə eyni ola bilməz.",
          "Panel məni çıxarıb: sessiya bitib. Yenidən daxil olun.",
          "Yazını yadda saxlamadan səhifəni bağladım: dəyişiklik itir. Hər işdən sonra \"Yadda saxla\" basın.",
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Plain-text export (for pasting into an AI assistant)
// ---------------------------------------------------------------------------

function withOrigin(text: string, origin: string): string {
  return text.split(ORIGIN_PLACEHOLDER).join(origin);
}

function blockToText(block: GuideBlock): string {
  switch (block.type) {
    case "p":
      return block.text;
    case "note":
      return `Qeyd: ${block.text}`;
    case "warn":
      return `Diqqət: ${block.text}`;
    case "steps": {
      const lines = block.items.map((item, i) => `${i + 1}. ${item}`);
      return [block.title ? `${block.title}:` : "", ...lines].filter(Boolean).join("\n");
    }
    case "list": {
      const lines = block.items.map((item) => `- ${item}`);
      return [block.title ? `${block.title}:` : "", ...lines].filter(Boolean).join("\n");
    }
  }
}

export function sectionToText(section: GuideSection, origin = ""): string {
  const body = section.blocks.map(blockToText).join("\n\n");
  return withOrigin(`## ${section.title}\n${section.summary}\n\n${body}`, origin);
}

/** Whole guide with the AI instructions on top; this is what the "copy" button puts on the clipboard. */
export function guideToText(sections: GuideSection[], origin: string): string {
  const parts = [
    "# THE9THWAY Agency: admin panelin istifadə təlimatı",
    withOrigin(AI_PREAMBLE, origin),
    "---",
    ...sections.map((s) => sectionToText(s, origin)),
    "---",
    "Mənim sualım:",
  ];
  return parts.join("\n\n");
}
