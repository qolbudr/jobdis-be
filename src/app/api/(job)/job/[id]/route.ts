import { NextRequest, NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'
import authMiddleware from '@/app/api/middlewares/authentication';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const job = await prisma.jobVacancy.delete({ where: { id: parseInt(params.id) } })
        return NextResponse.json(job)
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

        const job = await prisma.jobVacancy.findFirst({ where: { id: parseInt(params.id) }, include: { postedBy: true } })
        if(job == null) throw { message: `Job with id ${params.id} not found`}
        return NextResponse.json(job)
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
        const job = await prisma.jobVacancy.update({ where: { id: parseInt(params.id) }, data: data })
        return NextResponse.json(job)
    } catch (error) {
        return NextResponse.json({ titile: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}