// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const userData = require('./data/user.json');
const jobData = require('./data/job.json');

const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
    const argument = process.argv.slice(2)[0];
     await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 0`;
    await prisma.$queryRaw`TRUNCATE Users`;
    await prisma.$queryRaw`TRUNCATE JobVacancy`;

    if (argument == "users") {
        const password = await bcrypt.hash('11223344', 8);
        userData.forEach(async (element: any) => {
            element.password = password;
            if(element.role == "company") element.jobVacancies = { create: jobData }
            await prisma.users.create({ data: element })
        })
    }

    if (argument == "job") {
        jobData.forEach(async (element: any) => {
            await prisma.jobVacancy.create({ data: element })
        })
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
