import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ChatSessionStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const password = await bcrypt.hash(data.password, 8);

        const user = await prisma.users.create({
            data: {
                ...data,
                password: password,
                role: "user"
            }
        });

        if (user.role == "consultant") {
            await prisma.chatSession.create({
                data: {
                    "consultantId": user.id,
                    "price": 0,
                    "status": ChatSessionStatus.online,
                }
            })
        }

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}