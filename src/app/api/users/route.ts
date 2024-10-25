import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '../middlewares/authentication';
import { NextApiRequest } from 'next';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('@/database/models/user');

export async function GET(req: NextRequest) {
    try {
        // Apply the authentication middleware
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter");
        


        const user = await User.findAll({ where: { role: 'My Title' } });
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}
