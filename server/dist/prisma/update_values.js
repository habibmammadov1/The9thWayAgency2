"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const az = await prisma.contactWhyChooseUsContent.update({
        where: { locale: 'az' },
        data: { chartBarValues: [85, 65, 75, 90, 70] }
    });
    const en = await prisma.contactWhyChooseUsContent.update({
        where: { locale: 'en' },
        data: { chartBarValues: [85, 65, 75, 90, 70] }
    });
    const ru = await prisma.contactWhyChooseUsContent.update({
        where: { locale: 'ru' },
        data: { chartBarValues: [85, 65, 75, 90, 70] }
    });
    console.log('Successfully updated DB values for contact page chart:', {
        az: az.chartBarValues,
        en: en.chartBarValues,
        ru: ru.chartBarValues
    });
}
main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
    console.error(e);
    prisma.$disconnect();
});
