import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import authMiddleware from '@/app/api/middlewares/authentication';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const user = await prisma.users.delete({ where: { id: parseInt(params.id) } })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ titile: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const user = await prisma.users.findFirst({ where: { id: parseInt(params.id) } })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ titile: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const data = await req.json();
        const user = await prisma.users.update({ where: { id: parseInt(params.id) }, data: data })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ titile: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}