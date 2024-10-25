import { NextRequest, NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../../middlewares/authentication';

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
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}