"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const locales = ['az', 'ru', 'en'];
async function main() {
    console.log('Start seeding...');
    // Clear existing data
    await prisma.heroSlide.deleteMany();
    await prisma.heroTeamLead.deleteMany();
    await prisma.uniquenessCard.deleteMany();
    await prisma.aboutStat.deleteMany();
    await prisma.aboutStatsContent.deleteMany();
    await prisma.footerContent.deleteMany();
    await prisma.footerSocialLink.deleteMany();
    await prisma.servicesIntro.deleteMany();
    await prisma.service.deleteMany();
    await prisma.whyChooseUsIntro.deleteMany();
    await prisma.industry.deleteMany();
    await prisma.statHighlightCard.deleteMany();
    await prisma.whyChooseUsCard.deleteMany();
    await prisma.happyClientsCard.deleteMany();
    await prisma.supportCard.deleteMany();
    for (const locale of locales) {
        const filePath = path_1.default.resolve(__dirname, `../../src/i18n/messages/${locale}.json`);
        if (!fs_1.default.existsSync(filePath)) {
            console.warn(`Missing translations for locale: ${locale}`);
            continue;
        }
        const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
        console.log(`Seeding locale: ${locale}...`);
        // 1. Hero Slides
        const slidesData = data.Hero?.slides || {};
        let slideOrder = 1;
        for (const [key, val] of Object.entries(slidesData)) {
            await prisma.heroSlide.create({
                data: {
                    locale,
                    order: slideOrder++,
                    overline: val.overline || '',
                    headline: val.headline || '',
                    description: val.supporting || '',
                    imageUrl: '' // placeholder
                }
            });
        }
        // 2. Hero Team Lead
        await prisma.heroTeamLead.create({
            data: {
                locale,
                name: 'John Doe', // Mock
                role: data.Hero?.founderTitle || '',
                linkLabel: data.Hero?.letsTalk || '',
                photoUrl: '' // placeholder
            }
        });
        // 3. Uniqueness Cards
        const cardsData = data.Uniqueness?.cards || {};
        let cardOrder = 1;
        for (const [key, val] of Object.entries(cardsData)) {
            await prisma.uniquenessCard.create({
                data: {
                    locale,
                    order: cardOrder++,
                    icon: 'placeholder',
                    title: val.title || '',
                    description: val.desc || '',
                    imageUrl: ''
                }
            });
        }
        // 4. About Stats Content
        await prisma.aboutStatsContent.create({
            data: {
                locale,
                heading: data.AboutStats?.title || '',
                paragraph: data.AboutStats?.desc || '',
                imageUrl: '',
                caption: 'Customer Happiness'
            }
        });
        // 5. About Stat
        const statsData = data.AboutStats?.stats || {};
        const defaultValues = ["8+", "250+", "98%", "100%"];
        let statOrder = 1;
        for (const [key, val] of Object.entries(statsData)) {
            await prisma.aboutStat.create({
                data: {
                    locale,
                    order: statOrder,
                    value: defaultValues[statOrder - 1] || '0',
                    label: val || ''
                }
            });
            statOrder++;
        }
        // 6. Footer Content
        await prisma.footerContent.create({
            data: {
                locale,
                connectHeading: data.Footer?.stayConnected || '',
                email: 'hello@the9thway.com',
                supportingText: data.Footer?.desc || '',
                ctaLabel: data.Footer?.contactNow || '',
                copyrightText: data.Footer?.copyrightText || '',
            }
        });
        // 7. Services Page Content (Fresh Seed)
        const freshServicesContent = {
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
        await prisma.servicesIntro.create({
            data: {
                locale,
                pillLabel: sData.intro.pill,
                heading: sData.intro.heading,
                ctaLabel: sData.intro.viewAll
            }
        });
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
        const wData = sData.why;
        await prisma.whyChooseUsIntro.create({
            data: {
                locale,
                pillLabel: wData.pill,
                heading: wData.heading,
                paragraph: wData.supporting
            }
        });
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
        await prisma.statHighlightCard.create({
            data: {
                locale,
                value: wData.stat.value,
                label: wData.stat.label,
                ctaText: wData.stat.ctaText,
                ctaLinkLabel: wData.stat.linkText
            }
        });
        await prisma.whyChooseUsCard.create({
            data: {
                locale,
                heading: wData.checklist.title,
                paragraph: wData.checklist.desc,
                checklistItems: wData.checklist.list,
                ctaLabel: wData.checklist.button
            }
        });
        await prisma.happyClientsCard.create({
            data: {
                locale,
                percentage: wData.happyClients.stat,
                label: wData.happyClients.label,
                clientCount: '150+',
                avatarUrls: ['/avatars/user-01.png', '/avatars/user-02.png', '/avatars/user-03.png']
            }
        });
        await prisma.supportCard.create({
            data: {
                locale,
                badge: wData.support.title,
                heading: 'Always On Support', // this was hardcoded in previous seed too
                description: wData.support.desc
            }
        });
    }
    // 7. Footer Social Links (Global, not locale specific, so run once)
    console.log('Seeding global social links...');
    await prisma.footerSocialLink.createMany({
        data: [
            { platform: 'Instagram', url: 'https://instagram.com/the9thway', order: 1 },
            { platform: 'LinkedIn', url: 'https://linkedin.com/company/the9thway', order: 2 },
            { platform: 'Behance', url: 'https://behance.net/the9thway', order: 3 },
            { platform: 'X', url: 'https://x.com/the9thway', order: 4 },
        ]
    });
    // 8. Client Logos
    console.log('Seeding client logos...');
    await prisma.clientLogo.createMany({
        data: [
            { name: 'Nexora', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 1 },
            { name: 'Vertek', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 2 },
            { name: 'Solmark', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 3 },
            { name: 'Kryonic', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 4 },
            { name: 'Orbitly', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 5 },
            { name: 'Halcyon', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80&auto=format&fit=crop', order: 6 },
        ]
    });
    console.log('Seeding finished.');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
