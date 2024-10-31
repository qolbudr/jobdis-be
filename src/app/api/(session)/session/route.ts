import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const token = req.headers.get("authorization");
        const decoded = jwt.decode(token!) as { [key: string]: any };
        const id = decoded.id;

        const response = await prisma.chatSession.findFirstOrThrow({ include: { consultant: true }, where: { consultantId: { equals: id } } });
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const token = req.headers.get("authorization");
        const decoded = jwt.decode(token!) as { [key: string]: any };
        const id = decoded.id;

        const data = await req.json();
        data.consultantId = undefined;
        data.id = undefined;
        data.consultant = undefined
        
        const response = await prisma.chatSession.update({ where: { consultantId: id }, data: data })
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
