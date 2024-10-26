import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Apply the authentication middleware
        // const authResponse = await authMiddleware(req)
        // if (authResponse.status !== 200) {
        //     return authResponse
        // }

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter");

        const jobs = await prisma.jobVacancy.findMany({
            include: {
                postedBy: true
            },
        })

        return NextResponse.json(jobs)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
