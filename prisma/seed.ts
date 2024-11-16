// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const userData: Array<any> = require('./data/user.json');
const jobData = require('./data/job.json');
const chatSession = require('./data/chat_session.json');
const paymentChatData = require('./data/payment_chat.json');
const chat = require('./data/chat.json');
const paymentMapping = require('./data/payment_mapping.json');
const mappingQuestion = require('./data/mapping_question.json');
const interestTest = require('./data/interest_test.json');

const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
    await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 0`;
    await prisma.$queryRaw`TRUNCATE Users`;
    await prisma.$queryRaw`TRUNCATE JobVacancy`;
    await prisma.$queryRaw`TRUNCATE PaymentChat`;
    await prisma.$queryRaw`TRUNCATE ChatSession`;
    await prisma.$queryRaw`TRUNCATE Chat`;
    await prisma.$queryRaw`TRUNCATE PaymentMapping`;
    await prisma.$queryRaw`TRUNCATE MappingQuestion`;
    await prisma.$queryRaw`TRUNCATE InterestTest`;

    const password = await bcrypt.hash('11223344', 8);

    for (let i = 0; i < userData.length; i++) {
        let element = userData[i];
        element.password = password;
        await prisma.users.create({ data: element })
    }

    for (let i = 0; i < jobData.length; i++) {
        let element = jobData[i];
        await prisma.jobVacancy.create({ data: element })
    }

    for (let i = 0; i < chatSession.length; i++) {
        let element = chatSession[i];
        await prisma.chatSession.create({ data: element })
    }

    for (let i = 0; i < paymentChatData.length; i++) {
        let element = paymentChatData[i];
        await prisma.paymentChat.create({ data: element })
    }

    for (let i = 0; i < chat.length; i++) {
        let element = chat[i];
        await prisma.chat.create({ data: element })
    }

    for (let i = 0; i < paymentMapping.length; i++) {
        let element = paymentMapping[i];
        await prisma.paymentMapping.create({ data: element })
    }

    for (let i = 0; i < mappingQuestion.length; i++) {
        let element = mappingQuestion[i];
        await prisma.mappingQuestion.create({ data: element })
    }

    for (let i = 0; i < interestTest.length; i++) {
        let element = interestTest[i];
        await prisma.interestTest.create({ data: element })
    }
}

main().then(
    async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }
    )
