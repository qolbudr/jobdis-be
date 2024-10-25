// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
    // Example seeding for a `User` model
    const password = await bcrypt.hash('11223344', 8);

    await prisma.users.create({
        data: {
            email: 'user@gmail.com',
            password: password,
            name: 'Alejandro Garnacho',
            role: 'user'
        }
    })

    await prisma.users.create({
        data: {
            email: 'admin@gmail.com',
            password: password,
            name: 'Bruno Fernandes',
            role: 'admin'
        }
    })

    await prisma.users.create({
        data: {
            email: 'company@gmail.com',
            password: password,
            name: 'Facundo Pellistri',
            role: 'company'
        }
    })

    await prisma.users.create({
        data: {
            email: 'consultant@gmail.com',
            password: password,
            name: 'Casemiro',
            role: 'consultant'
        }
    })
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
