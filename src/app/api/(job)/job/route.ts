import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        // Apply the authentication middleware
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const job = await prisma.jobVacancy.create({
            data: {
                ...data,
                salary: data.salary ? parseInt(data.salary) : null
            }
        });

        return NextResponse.json(job)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}