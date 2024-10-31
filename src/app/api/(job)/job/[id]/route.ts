import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import authMiddleware from '@/app/api/middlewares/authentication';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const response = await prisma.jobVacancy.delete({ where: { id: parseInt(params.id) } })
        return NextResponse.json(response)
    }
    catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const response = await prisma.jobVacancy.findFirst({ where: { id: parseInt(params.id) }, include: { postedBy: true } })
        if (response == null) throw { message: `Job with id ${params.id} not found` }
        return NextResponse.json(response)
    }
    catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const data = await req.json();
        const response = await prisma.jobVacancy.update({
            where: { 
                id: parseInt(params.id) 
            }, 
            data: {
                ...data,
                id: undefined,
                userId: undefined,
                postedBy: undefined,
                salary: data.salary ? parseInt(data.salary) : null
            }
        })
        return NextResponse.json(response)
    }
    catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}