// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const userData: Array<any> = require('./data/user.json');
const jobData = require('./data/job.json');
const chatSession = require('./data/chat_session.json');
const paymentChatData = require('./data/payment_chat.json');

const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
    await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 0`;
    await prisma.$queryRaw`TRUNCATE Users`;
    await prisma.$queryRaw`TRUNCATE JobVacancy`;
    await prisma.$queryRaw`TRUNCATE PaymentChat`;
    await prisma.$queryRaw`TRUNCATE ChatSession`;

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
