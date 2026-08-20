import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const locales = ['az', 'ru', 'en']

function slugify(text: string): string {
  const map: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'ə': 'e', 'ç': 'c', 'ğ': 'g', 'ö': 'o', 'ş': 's', 'ı': 'i'
  };
  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseLocaleDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed);

  const monthsMap: { [key: string]: number } = {
    'янв': 0, 'фев': 1, 'мар': 2, 'апр': 3, 'май': 4, 'мая': 4, 'июн': 5, 'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11,
    'yan': 0, 'fev': 1, 'mar': 2, 'apr': 3, 'may': 4, 'iyn': 5, 'iyl': 6, 'avq': 7, 'sen': 8, 'okt': 9, 'noy': 10, 'dek': 11
  };

  const parts = dateStr.toLowerCase().replace(',', '').split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].substring(0, 3);
    const year = parseInt(parts[2], 10);
    const month = monthsMap[monthName] !== undefined ? monthsMap[monthName] : 0;
    if (!isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date();
}

function parseHtmlToBlocks(html: string): { type: string; value: string }[] {
  if (!html) return [];
  const regex = /<(p|h2|blockquote)>(.*?)<\/\1>/g;
  const blocks: { type: string; value: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[1];
    const content = match[2];
    const type = tag === 'p' ? 'paragraph' : tag === 'h2' ? 'heading' : 'quote';
    blocks.push({ type, value: content });
  }
  if (blocks.length === 0) {
    blocks.push({ type: 'paragraph', value: html });
  }
  return blocks;
}

async function main() {
  console.log('Start seeding...')

  // Fetch existing row counts
  const heroSlideCount = await prisma.heroSlide.count()
  const blogCategoryCount = await prisma.blogCategory.count()
  const blogPostCount = await prisma.blogPost.count()
  const heroTeamLeadCount = await prisma.heroTeamLead.count()
  const uniquenessCardCount = await prisma.uniquenessCard.count()
  const aboutStatCount = await prisma.aboutStat.count()
  const aboutStatsContentCount = await prisma.aboutStatsContent.count()
  const footerContentCount = await prisma.footerContent.count()
  const footerSocialLinkCount = await prisma.footerSocialLink.count()

  const servicesIntroCount = await prisma.servicesIntro.count()
  const serviceCount = await prisma.service.count()
  const whyChooseUsIntroCount = await prisma.whyChooseUsIntro.count()
  const industryCount = await prisma.industry.count()
  const statHighlightCardCount = await prisma.statHighlightCard.count()
  const whyChooseUsCardCount = await prisma.whyChooseUsCard.count()
  const happyClientsCardCount = await prisma.happyClientsCard.count()
  const supportCardCount = await prisma.supportCard.count()

  const testimonialsSectionIntroCount = await prisma.testimonialsSectionIntro.count()
  const testimonialHighlightCount = await prisma.testimonialHighlight.count()
  const testimonialCount = await prisma.testimonial.count()

  const portfolioHeroCount = await prisma.portfolioHero.count()
  const caseStudyCount = await prisma.caseStudy.count()
  const portfolioFAQIntroCount = await prisma.portfolioFAQIntro.count()
  const fAQItemCount = await prisma.fAQItem.count()
  const clientLogoCount = await prisma.clientLogo.count()

  const studioIntroContentCount = await prisma.studioIntroContent.count()
  const whatWeBuildContentCount = await prisma.whatWeBuildContent.count()
  const whatWeBuildFeatureCount = await prisma.whatWeBuildFeature.count()
  const missionVisionContentCount = await prisma.missionVisionContent.count()
  const recommendationSnippetCount = await prisma.recommendationSnippet.count()

  for (const locale of locales) {
    const filePath = path.resolve(__dirname, `../../src/i18n/messages/${locale}.json`)
    if (!fs.existsSync(filePath)) {
      console.warn(`Missing translations for locale: ${locale}`)
      continue
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    console.log(`Seeding locale: ${locale}...`)

    // 1. Hero Slides
    if (heroSlideCount === 0) {
      const slidesData = data.Hero?.slides || {}
      let slideOrder = 1
      for (const [key, val] of Object.entries(slidesData) as any) {
        await prisma.heroSlide.create({
          data: {
            locale,
            order: slideOrder++,
            overline: val.overline || '',
            headline: val.headline || '',
            description: val.supporting || '',
            imageUrl: '' // placeholder
          }
        })
      }
    }

    // 2. Hero Team Lead
    if (heroTeamLeadCount === 0) {
      await prisma.heroTeamLead.create({
        data: {
          locale,
          name: 'John Doe', // Mock
          role: data.Hero?.founderTitle || '',
          linkLabel: data.Hero?.letsTalk || '',
          photoUrl: '' // placeholder
        }
      })
    }

    // 3. Uniqueness Cards
    if (uniquenessCardCount === 0) {
      const cardsData = data.Uniqueness?.cards || {}
      let cardOrder = 1
      for (const [key, val] of Object.entries(cardsData) as any) {
        await prisma.uniquenessCard.create({
          data: {
            locale,
            order: cardOrder++,
            icon: 'placeholder',
            title: val.title || '',
            description: val.desc || '',
            imageUrl: ''
          }
        })
      }
    }

    // 4. About Stats Content
    if (aboutStatsContentCount === 0) {
      await prisma.aboutStatsContent.create({
        data: {
          locale,
          heading: data.AboutStats?.title || '',
          paragraph: data.AboutStats?.desc || '',
          imageUrl: '',
          caption: 'Customer Happiness'
        }
      })
    }

    // 5. About Stat
    if (aboutStatCount === 0) {
      const statsData = data.AboutStats?.stats || {}
      const defaultValues = ["8+", "250+", "98%", "100%"]
      let statOrder = 1
      for (const [key, val] of Object.entries(statsData) as any) {
        await prisma.aboutStat.create({
          data: {
            locale,
            order: statOrder,
            value: defaultValues[statOrder - 1] || '0',
            label: val || ''
          }
        })
        statOrder++
      }
    }

    // 6. Footer Content
    if (footerContentCount === 0) {
      await prisma.footerContent.create({
        data: {
          locale,
          connectHeading: data.Footer?.stayConnected || '',
          email: 'hello@the9thway.com',
          supportingText: data.Footer?.desc || '',
          ctaLabel: data.Footer?.contactNow || '',
          copyrightText: data.Footer?.copyrightText || '',
        }
      })
    }

    // 7. Services Page Content (Fresh Seed)
    const freshServicesContent: Record<string, any> = {
      az: {
        intro: { pill: 'Xidmətlərimiz', heading: 'Biznesinizi Növbəti Mərhələyə Daşıyan Rəqəmsal Həllər', viewAll: 'Bütün Xidmətlərə Bax' },
        services: [
          {
            title: 'Kompleks Rəqəmsal Marketinq',
            desc: 'Brendinizin onlayn mövcudluğunu artırmaq üçün dataya əsaslanan və nəticəyönümlü marketinq strategiyalarının hazırlanması və idarə edilməsi.',
            features: ['Bazar analizi və strategiya', 'Sosial media idarəetməsi (SMM)', 'Rəqəmsal reklam kampaniyaları (PPC)', 'Məzmun marketinqi']
          },
          {
            title: 'Veb İnkişafı və UI/UX Dizayn',
            desc: 'İstifadəçi təcrübəsini ön planda tutan, sürətli və müasir veb platformaların sıfırdan dizaynı və proqramlaşdırılması.',
            features: ['İstifadəçi interfeysi (UI) dizaynı', 'İstifadəçi təcrübəsi (UX) optimizasiyası', 'Özəl veb proqramlaşdırma', 'E-ticarət həlləri']
          },
          {
            title: 'Brendinq və Vizual İdentifikasiya',
            desc: 'Şirkətinizin dəyərlərini əks etdirən yaddaqalan və fərqlənən brend kimliyinin yaradılması.',
            features: ['Loqo və korporativ stil', 'Brend strategiyası', 'Qablaşdırma dizaynı', 'Brend arxitekturası']
          },
          {
            title: 'Axtarış Motoru Optimizasiyası (SEO)',
            desc: 'Veb saytınızın axtarış sistemlərindəki reytinqini artıraraq orqanik və davamlı trafikin təmin edilməsi.',
            features: ['Texniki SEO auditi', 'Açar söz analizi', 'Səhifədaxili optimizasiya (On-page)', 'Link quruculuğu']
          },
          {
            title: 'Məlumat Analitikası və Hesabatlılıq',
            desc: 'Dəqiq qərarlar qəbul etməyiniz üçün performans məlumatlarının toplanması, təhlili və vizuallaşdırılması.',
            features: ['Google Analytics quraşdırması', 'Performans hesabatları', 'Dönüşüm (Conversion) analizi', 'Məlumat vizuallaşdırma']
          }
        ],
        why: {
          pill: 'Niyə Biz?',
          heading: 'Uğurunuz Üçün Doğru Tərəfdaş',
          supporting: 'Təcrübəli komandamız və innovativ yanaşmamızla layihələrinizi hədəflərinizə çatdırırıq.',
          industries: ['E-ticarət', 'Daşınmaz Əmlak', 'SaaS / Texnologiya', 'Turizm və Otelçilik', 'Pərakəndə Satış'],
          stat: { value: '150+', label: 'Uğurlu Layihə', ctaText: 'Bizimlə Başlayın', linkText: 'Portfoliomuz' },
          checklist: {
            title: 'Bizim Fərqimiz',
            desc: 'Müştərilərimiz bizi nəticəyönümlü iş prinsipimizə görə seçir.',
            list: [
              'Dataya əsaslanan qərarlar',
              'Şəffaf və davamlı hesabatlılıq',
              'Sektor təcrübəsi və ekspertiza',
              'Layihələrə fərdi yanaşma',
              'Daimi inkişaf və innovasiya'
            ],
            button: 'Məsləhətləşmə Tələb Et'
          },
          happyClients: { stat: '98%', label: 'Müştəri Məmnuniyyəti' },
          support: { title: '24/7 Dəstək', desc: 'Sizə ehtiyacınız olduğu hər an kəsintisiz və peşəkar texniki dəstək göstəririk.' }
        }
      },
      ru: {
        intro: { pill: 'Наши Услуги', heading: 'Цифровые решения, выводящие ваш бизнес на новый уровень', viewAll: 'Смотреть все услуги' },
        services: [
          {
            title: 'Комплексный цифровой маркетинг',
            desc: 'Разработка и управление маркетинговыми стратегиями, основанными на данных и ориентированными на результат.',
            features: ['Анализ рынка и стратегия', 'Управление социальными сетями (SMM)', 'Цифровые рекламные кампании (PPC)', 'Контент-маркетинг']
          },
          {
            title: 'Веб-разработка и UI/UX Дизайн',
            desc: 'Проектирование и программирование быстрых и современных веб-платформ с упором на пользовательский опыт.',
            features: ['Дизайн интерфейса (UI)', 'Оптимизация пользовательского опыта (UX)', 'Индивидуальное веб-программирование', 'Решения для электронной коммерции']
          },
          {
            title: 'Брендинг и Визуальная Идентификация',
            desc: 'Создание запоминающейся идентичности бренда, отражающей ценности вашей компании.',
            features: ['Логотип и фирменный стиль', 'Стратегия бренда', 'Дизайн упаковки', 'Архитектура бренда']
          },
          {
            title: 'Поисковая Оптимизация (SEO)',
            desc: 'Обеспечение органического трафика за счет повышения рейтинга вашего сайта в поисковых системах.',
            features: ['Технический SEO аудит', 'Анализ ключевых слов', 'Внутренняя оптимизация', 'Наращивание ссылочной массы']
          },
          {
            title: 'Аналитика данных и отчетность',
            desc: 'Сбор, анализ и визуализация данных о производительности для принятия точных решений.',
            features: ['Настройка Google Analytics', 'Отчеты о производительности', 'Анализ конверсий', 'Визуализация данных']
          }
        ],
        why: {
          pill: 'Почему Мы?',
          heading: 'Правильный партнер для вашего успеха',
          supporting: 'С нашей опытной командой и инновационным подходом мы доводим ваши проекты до целей.',
          industries: ['E-commerce', 'Недвижимость', 'SaaS / Технологии', 'Туризм и Гостеприимство', 'Розничная Торговля'],
          stat: { value: '150+', label: 'Успешных проектов', ctaText: 'Начать с нами', linkText: 'Наше портфолио' },
          checklist: {
            title: 'Наше Отличие',
            desc: 'Наши клиенты выбирают нас за наш ориентированный на результат принцип работы.',
            list: [
              'Решения, основанные на данных',
              'Прозрачная и непрерывная отчетность',
              'Отраслевой опыт и экспертиза',
              'Индивидуальный подход к проектам',
              'Постоянное развитие и инновации'
            ],
            button: 'Запросить консультацию'
          },
          happyClients: { stat: '98%', label: 'Удовлетворенность клиентов' },
          support: { title: '24/7 Поддержка', desc: 'Мы предоставляем бесперебойную и профессиональную техническую поддержку.' }
        }
      },
      en: {
        intro: { pill: 'Our Services', heading: 'Digital Solutions That Take Your Business to the Next Level', viewAll: 'View All Services' },
        services: [
          {
            title: 'Comprehensive Digital Marketing',
            desc: 'Development and management of data-driven and result-oriented marketing strategies to boost your online presence.',
            features: ['Market analysis & strategy', 'Social media management (SMM)', 'Digital ad campaigns (PPC)', 'Content marketing']
          },
          {
            title: 'Web Development & UI/UX Design',
            desc: 'Design and programming of fast and modern web platforms prioritizing user experience from scratch.',
            features: ['User Interface (UI) design', 'User Experience (UX) optimization', 'Custom web programming', 'E-commerce solutions']
          },
          {
            title: 'Branding & Visual Identity',
            desc: 'Creating a memorable and distinctive brand identity that reflects the values of your company.',
            features: ['Logo and corporate style', 'Brand strategy', 'Packaging design', 'Brand architecture']
          },
          {
            title: 'Search Engine Optimization (SEO)',
            desc: 'Ensuring organic and sustainable traffic by increasing your website ranking in search engines.',
            features: ['Technical SEO audit', 'Keyword analysis', 'On-page optimization', 'Link building']
          },
          {
            title: 'Data Analytics & Reporting',
            desc: 'Collecting, analyzing, and visualizing performance data to help you make accurate decisions.',
            features: ['Google Analytics setup', 'Performance reports', 'Conversion analysis', 'Data visualization']
          }
        ],
        why: {
          pill: 'Why Choose Us?',
          heading: 'The Right Partner For Your Success',
          supporting: 'With our experienced team and innovative approach, we bring your projects to their goals.',
          industries: ['E-commerce', 'Real Estate', 'SaaS / Technology', 'Tourism & Hospitality', 'Retail'],
          stat: { value: '150+', label: 'Successful Projects', ctaText: 'Start with us', linkText: 'Our Portfolio' },
          checklist: {
            title: 'Our Difference',
            desc: 'Our clients choose us for our results-oriented working principle.',
            list: [
              'Data-driven decisions',
              'Transparent and continuous reporting',
              'Industry experience and expertise',
              'Personalized approach to projects',
              'Continuous development and innovation'
            ],
            button: 'Request a Consultation'
          },
          happyClients: { stat: '98%', label: 'Client Satisfaction' },
          support: { title: '24/7 Support', desc: 'We provide uninterrupted and professional technical support whenever you need it.' }
        }
      }
    };

    const sData = freshServicesContent[locale] || freshServicesContent['en'];
    if (servicesIntroCount === 0) {
      await prisma.servicesIntro.create({
        data: {
          locale,
          pillLabel: sData.intro.pill,
          heading: sData.intro.heading,
          ctaLabel: sData.intro.viewAll
        }
      });
    }

    if (serviceCount === 0) {
      const servicesList = sData.services;
      for (let i = 0; i < servicesList.length; i++) {
        const s = servicesList[i];
        await prisma.service.create({
          data: {
            locale,
            order: i + 1,
            icon: 'placeholder',
            title: s.title,
            description: s.desc,
            bullets: s.features
          }
        });
      }
    }

    const wData = sData.why;
    if (whyChooseUsIntroCount === 0) {
      await prisma.whyChooseUsIntro.create({
        data: {
          locale,
          pillLabel: wData.pill,
          heading: wData.heading,
          paragraph: wData.supporting
        }
      });
    }

    if (industryCount === 0) {
      const industries = wData.industries;
      for (let i = 0; i < industries.length; i++) {
        await prisma.industry.create({
          data: {
            locale,
            order: i + 1,
            name: industries[i]
          }
        });
      }
    }

    if (statHighlightCardCount === 0) {
      await prisma.statHighlightCard.create({
        data: {
          locale,
          value: wData.stat.value,
          label: wData.stat.label,
          ctaText: wData.stat.ctaText,
          ctaLinkLabel: wData.stat.linkText
        }
      });
    }

    if (whyChooseUsCardCount === 0) {
      await prisma.whyChooseUsCard.create({
        data: {
          locale,
          heading: wData.checklist.title,
          paragraph: wData.checklist.desc,
          checklistItems: wData.checklist.list,
          ctaLabel: wData.checklist.button
        }
      });
    }

    if (happyClientsCardCount === 0) {
      await prisma.happyClientsCard.create({
        data: {
          locale,
          percentage: wData.happyClients.stat,
          label: wData.happyClients.label,
          clientCount: '150+',
          avatarUrls: ['/avatars/user-01.png', '/avatars/user-02.png', '/avatars/user-03.png']
        }
      });
    }

    if (supportCardCount === 0) {
      await prisma.supportCard.create({
        data: {
          locale,
          badge: wData.support.title,
          heading: 'Always On Support',
          description: wData.support.desc
        }
      });
    }

    // Seeding Testimonials
    if (testimonialsSectionIntroCount === 0) {
      await prisma.testimonialsSectionIntro.createMany({
        data: [
          {
            locale,
            page: 'home',
            heading: data.Testimonials?.title || 'What Our Clients Say'
          },
          {
            locale,
            page: 'services',
            heading: data.Testimonials?.servicesTitle || 'What Clients Say About Our Services'
          },
          {
            locale,
            page: 'portfolio',
            heading: data.PortfolioPage?.Testimonials?.heading || 'What Our Partners Say'
          }
        ]
      })
    }

    if (testimonialHighlightCount === 0) {
      const blurbs: Record<string, string> = {
        az: 'Möhtəşəm dizayn və güclü mühəndislik ilə dünya səviyyəli brendlərin öz bazarlarında liderlik etməsinə kömək edirik.',
        ru: 'Мы помогаем брендам мирового класса доминировать на своих рынках с помощью смелого креативного дизайна и надежной инженерии.',
        en: 'Helping world-class brands dominate their markets with fearless creative design and robust engineering.'
      }

      await prisma.testimonialHighlight.create({
        data: {
          locale,
          rating: '4.9',
          reviewCount: '(40+ reviews)',
          blurb: blurbs[locale] || blurbs['en']
        }
      })
    }

    if (testimonialCount === 0) {
      const reviewsData = data.Testimonials?.reviews || {}
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
      ]
      const defaultNames = ["Sarah Jenkins", "Marcus Thorne", "Elena Rodriguez", "David Chen"]

      for (let i = 1; i <= 4; i++) {
        const rev = reviewsData[`rev${i}`] || {}
        await prisma.testimonial.create({
          data: {
            locale,
            order: i,
            quote: rev.quote || '',
            clientName: defaultNames[i - 1],
            clientRole: rev.role || '',
            avatarUrl: defaultAvatars[i - 1],
            trustBadge: 'Google Reviews'
          }
        })
      }
    }

    // Seeding Portfolio Page
    const pData = data.PortfolioPage || {}
    const pHero = pData.Hero || {}
    if (portfolioHeroCount === 0) {
      await prisma.portfolioHero.create({
        data: {
          locale,
          pillLabel: pHero.pill || 'Case Studies',
          heading: pHero.heading || 'Recent Work',
          paragraph: pHero.paragraph || '',
          primaryCtaLabel: pHero.primaryBtn || 'Get a Consultation',
          secondaryCtaLabel: pHero.secondaryBtn || 'About Us',
          backgroundImageUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1200'
        }
      })
    }

    const pCases = pData.CaseStudies?.cases || []
    const colorThemes = ["ink", "lime-dark", "ink-light", "ink"]
    const caseDetails = [
      {
        slug: "aurora",
        galleryImageUrls: [
          "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600",
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600",
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600"
        ],
        challenge: {
          az: "Şirkətin köhnəlmiş rəqəmsal kimliyi onun bazar mövqeyinə və müştəri güvəninə mənfi təsir edirdi. Brendin müasir rəqəmsal dünyada daha cəlbedici olması üçün tamamilə yeni dizayn dilinə ehtiyacı var idi.",
          ru: "Устаревший цифровой бренд компании негативно влиял на её рыночное позиционирование и доверие клиентов. Бренду требовался полностью новый язык дизайна для успешного позиционирования в современной цифровой среде.",
          en: "The company's outdated digital identity was negatively affecting its market positioning and client trust. The brand required a completely new design language to stand out in the modern digital landscape."
        },
        approach: {
          az: "Biz geniş bazar araşdırması apardıq və brendin loqosunu, rəng palitrasını və veb platformalarını tamamilə yenidən qurduq. Parlaq, sürətli və minimalist yanaşma tətbiq etdik.",
          ru: "Мы провели обширное исследование рынка и полностью переосмыслили логотип, цветовую палитру и веб-платформы бренда. Был внедрен яркий, быстрый и минималистичный подход.",
          en: "We conducted extensive market research and completely rebuilt the brand's logo, color palette, and web platforms. We implemented a sleek, fast, and minimalist design approach."
        },
        result: {
          az: "Nəticədə brend şüurluluğu 150% artdı, sosial media istifadəçiləri ilə qarşılıqlı əlaqə 64% yüksəldi və müştəri məmnuniyyəti rekord səviyyəyə çatdı.",
          ru: "В результате узнаваемость бренда выросла на 150%, вовлеченность в социальных сетях увеличилась на 64%, а удовлетворенность клиентов достигла рекордного уровня.",
          en: "As a result, brand awareness increased by 150%, social media engagement rose by 64%, and client satisfaction reached record-high levels."
        }
      },
      {
        slug: "nexus",
        galleryImageUrls: [
          "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600"
        ],
        challenge: {
          az: "Köhnə e-ticarət sistemi böyüyən istifadəçi axınını idarə edə bilmir, yavaş sürət və mürəkkəb ödəniş prosesi səbəbindən müştəri itkisinə səbəb olurdu.",
          ru: "Старая система электронной коммерции не справлялась с растущим потоком пользователей, приводя к потере клиентов из-за низкой скорости работы и сложного процесса оплаты.",
          en: "The legacy e-commerce system failed to handle the growing user traffic, leading to customer churn due to slow loading speeds and a complicated checkout flow."
        },
        approach: {
          az: "Biz tamamilə yeni bulud əsaslı arxitektura tətbiq etdik, mobil tətbiqi optimallaşdırdıq və ödəniş addımlarını cəmi bir klikə endirdik.",
          ru: "Мы внедрили совершенно новую облачную архитектуру, оптимизировали мобильное приложение и сократили процесс покупки всего до одного клика.",
          en: "We implemented a brand new cloud-based architecture, optimized the mobile application experience, and simplified the checkout process to a single click."
        },
        result: {
          az: "Konversiya dərəcəsi 45% yüksəldi, səhifə yüklənmə sürəti 3 dəfə artdı və müştəri itkisi əhəmiyyətli dərəcədə azaldı.",
          ru: "Коэффициент конверсии вырос на 45%, скорость загрузки страниц увеличилась в 3 раза, а отток клиентов существенно снизился.",
          en: "Conversion rate increased by 45%, page load speed improved 3x, and customer abandonment dropped significantly."
        }
      },
      {
        slug: "zenith",
        galleryImageUrls: [
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600",
          "https://images.unsplash.com/photo-1531535934027-68961557f242?q=80&w=600"
        ],
        challenge: {
          az: "Mürəkkəb daxili proseslər komandalar arasında əlaqəni zəiflədir, tapşırıqların icrasını gecikdirir və əməliyyat xərclərini artırırdı.",
          ru: "Сложные внутренние процессы затрудняли коммуникацию между командами, задерживали выполнение задач и увеличивали операционные расходы.",
          en: "Complex internal workflows hindered collaboration between teams, delayed task execution, and drove up overall operational costs."
        },
        approach: {
          az: "Biz daxili idarəetmə alətini dizayn etdik, avtomatlaşdırılmış iş axınları qurduq və bütün hesabatları bir mərkəzdə birləşdirdik.",
          ru: "Мы разработали внутренний инструмент управления, выстроили автоматизированные рабочие процессы и объединили всю отчетность в одном центре.",
          en: "We designed a bespoke internal management tool, set up automated task workflows, and unified all team reporting into a single dashboard."
        },
        result: {
          az: "Daxili səmərəlilik 80% artdı, tapşırıqların tamamlanma müddəti yarıya endi və komandalararası əlaqə gücləndi.",
          ru: "Внутренняя эффективность выросла на 80%, время выполнения задач сократилось вдвое, а командное взаимодействие улучшилось.",
          en: "Internal efficiency increased by 80%, task completion times were cut in half, and team collaboration improved greatly."
        }
      },
      {
        slug: "lumina",
        galleryImageUrls: [
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600",
          "https://images.unsplash.com/photo-1581291518655-9523c932dedf?q=80&w=600",
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600"
        ],
        challenge: {
          az: "Yeni məhsulun bazara çıxarılması üçün vahid və yaddaqalan vizual kimlik yox idi, bu da rəqabətdə geri qalmaq riski yaradırdı.",
          ru: "Для запуска нового продукта отсутствовал единый и запоминающийся визуальный стиль, что создавало риски проигрыша конкурентам.",
          en: "The launch of the new product lacked a cohesive and memorable visual identity, creating a risk of losing out to market competitors."
        },
        approach: {
          az: "Biz 3D elementlər və canlı rənglərlə zəngin olan interaktiv brend təcrübəsi hazırladıq, həmçinin unikal qablaşdırma dizaynı qurduq.",
          ru: "Мы разработали интерактивный брендовый опыт с использованием 3D-элементов и ярких цветов, а также создали уникальный дизайн упаковки.",
          en: "We developed an interactive brand experience featuring 3D elements and vibrant colors, and also designed unique product packaging."
        },
        result: {
          az: "Məhsul bazara böyük uğurla daxil oldu, istifadəçi məmnuniyyəti 95%-ə çatdı və brend rəqiblərindən fərqləndi.",
          ru: "Продукт вышел на рынок с огромным успехом, удовлетворенность пользователей достигла 95%, а бренд выделился среди конкурентов.",
          en: "The product successfully penetrated the market, user satisfaction reached 95%, and the brand stood out distinctively from competitors."
        }
      }
    ]
    if (caseStudyCount === 0) {
      for (let i = 0; i < pCases.length; i++) {
        const c = pCases[i]
        const details = caseDetails[i % caseDetails.length]
        await prisma.caseStudy.create({
          data: {
            locale,
            slug: details.slug,
            order: i + 1,
            tags: c.tags || [],
            title: c.title || '',
            colorTheme: colorThemes[i % colorThemes.length],
            stat1Value: c.stats?.[0]?.value || '',
            stat1Label: c.stats?.[0]?.label || '',
            stat2Value: c.stats?.[1]?.value || '',
            stat2Label: c.stats?.[1]?.label || '',
            stat3Value: c.stats?.[2]?.value || '',
            stat3Label: c.stats?.[2]?.label || '',
            viewProjectLabel: pData.CaseStudies?.viewProject || 'View Project',
            projectLink: '#',
            challenge: details.challenge[locale as 'az' | 'ru' | 'en'] || '',
            approach: details.approach[locale as 'az' | 'ru' | 'en'] || '',
            result: details.result[locale as 'az' | 'ru' | 'en'] || '',
            galleryImageUrls: details.galleryImageUrls
          }
        })
      }
    }

    const pFaq = pData.FAQ || {}
    if (portfolioFAQIntroCount === 0) {
      await prisma.portfolioFAQIntro.create({
        data: {
          locale,
          pillLabel: pFaq.pill || 'FAQ',
          heading: pFaq.heading || 'Frequently Asked Questions',
          calloutHeading: pFaq.calloutHeading || 'Have a Question?',
          calloutText: pFaq.calloutDesc || 'Write to us to discuss your project.',
          calloutCtaLabel: pFaq.calloutBtn || 'Contact Us'
        }
      })
    }

    if (fAQItemCount === 0) {
      const pFaqItems = pFaq.items || []
      for (let i = 0; i < pFaqItems.length; i++) {
        const item = pFaqItems[i]
        await prisma.fAQItem.create({
          data: {
            locale,
            order: i + 1,
            question: item.q || '',
            answer: item.a || ''
          }
        })
      }
    }

    // 6b. Blog Categories and Posts Seeding
    if (blogCategoryCount === 0 && blogPostCount === 0) {
      const postsData = data.BlogsPage?.posts || []
      const categoriesSet = new Set<string>()
      postsData.forEach((post: any) => {
        if (post.category) {
          categoriesSet.add(post.category)
        }
      })

      // Create categories
      const categoriesMap = new Map<string, string>() // Name -> Id
      let catOrder = 1
      for (const catName of Array.from(categoriesSet)) {
        const catSlug = slugify(catName)
        const category = await prisma.blogCategory.create({
          data: {
            locale,
            name: catName,
            slug: catSlug,
            order: catOrder++,
          }
        })
        categoriesMap.set(catName, category.id)
      }

      // Create posts
      for (const post of postsData) {
        const catId = post.category ? categoriesMap.get(post.category) : null
        const contentBlocks = parseHtmlToBlocks(post.content || '')

        await prisma.blogPost.create({
          data: {
            locale,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: contentBlocks,
            featuredImageUrl: post.image,
            categoryId: catId,
            authorName: post.author,
            authorBio: `${post.role} olaraq rəqəmsal trendləri təhlil edir.`,
            authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
            publishedAt: parseLocaleDate(post.date),
            isPublished: true,
          }
        })
      }
    }

    // 6c. About Page Content Seeding
    const aboutData = data.AboutPage || {}

    // Studio Intro
    if (studioIntroContentCount === 0) {
      await prisma.studioIntroContent.create({
        data: {
          locale,
          overline: aboutData.overline || 'STUDİYA',
          heading: aboutData.heading || '',
          paragraph: aboutData.paragraph || '',
          image1Url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop',
          image2Url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000&auto=format&fit=crop',
        }
      })
    }

    const wwbData = aboutData.WhatWeBuild || {}

    // What We Build Content
    if (whatWeBuildContentCount === 0) {
      await prisma.whatWeBuildContent.create({
        data: {
          locale,
          mainImageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop',
          statValue: wwbData.statValue || '100%',
          statLabel: wwbData.statLabel || 'Məmnun Müştəri',
          statCaption: wwbData.statCaption || 'Davamlı əməkdaşlıqlar',
          statAvatarUrls: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80'
          ],
          heading: wwbData.heading || '',
          paragraph: wwbData.paragraph || '',
          ctaLabel: wwbData.buttonLabel || 'Haqqımızda Daha Çox Öyrən'
        }
      })
    }

    // What We Build Feature list
    if (whatWeBuildFeatureCount === 0) {
      const featuresData = wwbData.features || {}
      const featureIcons = ['BarChart', 'Target', 'Users']
      let order = 1
      for (const [key, val] of Object.entries(featuresData) as any) {
        await prisma.whatWeBuildFeature.create({
          data: {
            locale,
            order: order,
            icon: featureIcons[order - 1] || 'BarChart',
            title: val.title || '',
            description: val.description || ''
          }
        })
        order++
      }
    }

    const mvData = aboutData.MissionVision || {}

    // Mission Vision Content
    if (missionVisionContentCount === 0) {
      await prisma.missionVisionContent.create({
        data: {
          locale,
          statValue: mvData.statValue || '100%',
          statLabel: mvData.statLabel || 'Məmnun Müştəri',
          statCaption: mvData.statCaption || 'Davamlı əməkdaşlıqlar',
          statAvatarUrls: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80'
          ],
          missionLabel: mvData.missionTitle || 'BİZİM MİSSİYAMIZ',
          missionText: mvData.missionDesc || '',
          visionLabel: mvData.visionTitle || 'BİZİM VİZYONUMUZ',
          visionText: mvData.visionDesc || ''
        }
      })
    }

    // Recommendation Snippets
    if (recommendationSnippetCount === 0) {
      const stats = mvData.stats || {}
      const quotes = mvData.quotes || {}

      const snippets = [
        { type: 'quote', text: quotes.q1 || '', value: null, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', order: 1 },
        { type: 'stat', text: stats.recommend || 'Tövsiyə Edir', value: '99%', avatarUrl: null, order: 2 },
        { type: 'quote', text: quotes.q2 || '', value: null, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', order: 3 },
        { type: 'stat', text: stats.reviews || 'Real Rəylər', value: '100%', avatarUrl: null, order: 4 },
        { type: 'quote', text: quotes.q3 || '', value: null, avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80', order: 5 }
      ]

      for (const snip of snippets) {
        await prisma.recommendationSnippet.create({
          data: {
            locale,
            order: snip.order,
            type: snip.type,
            text: snip.text,
            value: snip.value,
            avatarUrl: snip.avatarUrl
          }
        })
      }
    }
  }

  // 7. Footer Social Links (Global, not locale specific, so run once)
  if (footerSocialLinkCount === 0) {
    console.log('Seeding global social links...')
    await prisma.footerSocialLink.createMany({
      data: [
        { platform: 'Instagram', url: 'https://instagram.com/the9thway', order: 1 },
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/the9thway', order: 2 },
        { platform: 'Behance', url: 'https://behance.net/the9thway', order: 3 },
        { platform: 'X', url: 'https://x.com/the9thway', order: 4 },
      ]
    })
  }

  // 8. Client Logos
  if (clientLogoCount === 0) {
    console.log('Seeding client logos...')
    await prisma.clientLogo.createMany({
      data: [
        { name: 'Nexora', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 1 },
        { name: 'Vertek', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 2 },
        { name: 'Solmark', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 3 },
        { name: 'Kryonic', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 4 },
        { name: 'Orbitly', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 5 },
        { name: 'Halcyon', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 6 },
        { name: 'Cobalt Works', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 7 },
        { name: 'Northline', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 8 },
        { name: 'Verve Studio', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 9 },
        { name: 'Atlas & Co.', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 10 },
        { name: 'Meridian', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 11 },
        { name: 'Fluxa', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 12 },
      ]
    })
  }
  // 9. Contact Why Choose Us
  const contactWhyChooseUsCount = await prisma.contactWhyChooseUsContent.count()
  if (contactWhyChooseUsCount === 0) {
    console.log('Seeding Contact Why Choose Us content...')
    
    const localesList = ['az', 'en', 'ru'];
    const localizedContent = {
      az: {
        overline: "NİYƏ THE9THWAY?",
        chartLabel: "Data Analiz",
        chartHeading: "Etibarlı və Təcrübəli Komanda.",
        chartParagraph: "Rəqəmsal kampaniyalarınızın hər bir detalını ən incə təfərrüatına qədər izləyirik.",
        rightHeading: "NİYƏ BİZİM MARKETİNQ XİDMƏTLƏRİMİZİ SEÇMƏLİSİNİZ?",
        rightParagraph: "Biz yalnız yaradıcı dizayn deyil, həm də dataya əsaslanan strateji yanaşmalar tətbiq edərək, brendlərin qlobal miqyasda güclənməsini və yüksək gəlir (ROI) əldə etməsini təmin edirik.",
        bandText: "Harada Olursunuz Olun, Bizimlə İşləyin."
      },
      en: {
        overline: "WHY THE9THWAY?",
        chartLabel: "Data Analysis",
        chartHeading: "Reliable and Experienced Team.",
        chartParagraph: "We monitor every detail of your digital campaigns to the finest granularity.",
        rightHeading: "WHY SHOULD YOU CHOOSE OUR MARKETING SERVICES?",
        rightParagraph: "We apply not only creative design, but also data-driven strategic approaches to ensure that brands strengthen globally and achieve high return on investment (ROI).",
        bandText: "Work With Us, Wherever You Are."
      },
      ru: {
        overline: "ПОЧЕМУ THE9THWAY?",
        chartLabel: "Анализ Данных",
        chartHeading: "Надежная и Опытная Команда.",
        chartParagraph: "Мы отслеживаем каждую деталь ваших цифровых кампаний до мельчайших подробностей.",
        rightHeading: "ПОЧЕМУ ВЫ ДОЛЖНЫ ВЫБРАТЬ НАШИ МАРКЕТИНГОВЫЕ УСЛУГИ?",
        rightParagraph: "Мы применяем не только креативный дизайн, но и основанные на данных стратегические подходы, чтобы бренды укреплялись на мировом уровне и достигали высокой окупаемости инвестиций (ROI).",
        bandText: "Работать с нами, где бы вы ни находились."
      }
    };

    for (const locale of localesList) {
      const data = localizedContent[locale as 'az' | 'en' | 'ru'];
      await prisma.contactWhyChooseUsContent.create({
        data: {
          locale,
          overline: data.overline,
          chartLabel: data.chartLabel,
          chartHeading: data.chartHeading,
          chartParagraph: data.chartParagraph,
          chartBarValues: [85, 65, 75, 90, 70],
          rightHeading: data.rightHeading,
          rightParagraph: data.rightParagraph,
          bandText: data.bandText
        }
      });
    }
  }

  // 10. Contact Feature Cards
  const contactFeatureCardCount = await prisma.contactFeatureCard.count()
  if (contactFeatureCardCount === 0) {
    console.log('Seeding Contact Feature Cards...')
    const cardsData = {
      az: [
        { icon: 'Users', title: 'Peşəkar Komanda', description: 'Sahəsinin mütəxəssisi olan təcrübəli ekspertlər.' },
        { icon: 'Target', title: 'Hədəf Yönümlü', description: 'Biznes hədəflərinizə uyğun olaraq xüsusi hazırlanmış strategiyalar.' },
        { icon: 'TrendingUp', title: 'Ölçülə bilən Nəticə', description: 'Kampaniyalarımızın effektivliyini şəffaf hesabatlarla təqdim edirik.' },
        { icon: 'LifeBuoy', title: '7/24 Dəstək', description: 'İşinizin hər mərhələsində kəsintisiz əlaqə və operativ dəstək.' }
      ],
      en: [
        { icon: 'Users', title: 'Professional Team', description: 'Experienced experts who are specialists in their fields.' },
        { icon: 'Target', title: 'Target-Oriented', description: 'Tailor-made strategies tailored to your business goals.' },
        { icon: 'TrendingUp', title: 'Measurable Results', description: 'We present the effectiveness of our campaigns with transparent reports.' },
        { icon: 'LifeBuoy', title: '24/7 Support', description: 'Uninterrupted communication and prompt support at every stage.' }
      ],
      ru: [
        { icon: 'Users', title: 'Профессиональная Команда', description: 'Опытные эксперты, являющиеся специалистами в своих областях.' },
        { icon: 'Target', title: 'Целеориентированность', description: 'Специально разработанные стратегии, адаптированные под ваши цели.' },
        { icon: 'TrendingUp', title: 'Измеримые Результаты', description: 'Мы представляем эффективность наших кампаний с прозрачными отчетами.' },
        { icon: 'LifeBuoy', title: 'Поддержка 24/7', description: 'Бесперебойная связь и оперативная поддержка на каждом этапе.' }
      ]
    };

    for (const [locale, list] of Object.entries(cardsData)) {
      for (let i = 0; i < list.length; i++) {
        await prisma.contactFeatureCard.create({
          data: {
            locale,
            order: i + 1,
            icon: list[i].icon,
            title: list[i].title,
            description: list[i].description
          }
        });
      }
    }
  }

  // 11. Contact Info
  const contactInfoCount = await prisma.contactInfo.count()
  if (contactInfoCount === 0) {
    console.log('Seeding Contact Info...')
    const infoData = {
      az: { address: 'Baku, Azerbaijan\nNizami str. 142', phone: '+994 12 345 6789', email: 'hello@the9thway.com', workingHours: 'B.e - C. 09:00 - 18:00' },
      en: { address: 'Baku, Azerbaijan\nNizami str. 142', phone: '+994 12 345 6789', email: 'hello@the9thway.com', workingHours: 'Mon - Sat 09:00 - 18:00' },
      ru: { address: 'Баку, Азербайджан\nул. Низами 142', phone: '+994 12 345 6789', email: 'hello@the9thway.com', workingHours: 'Пн - Сб 09:00 - 18:00' }
    };

    for (const [locale, info] of Object.entries(infoData)) {
      await prisma.contactInfo.create({
        data: {
          locale,
          address: info.address,
          phone: info.phone,
          email: info.email,
          workingHours: info.workingHours,
          mapLatitude: 40.394508,
          mapLongitude: 49.714875
        }
      });
    }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
