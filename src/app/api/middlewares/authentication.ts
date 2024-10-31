const jwt = require('jsonwebtoken');

import { NextApiRequest } from 'next'
import { NextRequest, NextResponse } from 'next/server';

type Middleware = (req: NextRequest) => NextResponse

const authMiddleware: Middleware = (req) => {
    const token = req.headers.get('authorization')
    if (!token) return NextResponse.json({ title: 'Missing token', message: 'Access denied, token missing!', code: 401 }, { status: 401 });

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return NextResponse.next() // Proceed
    } catch (error) {
        return NextResponse.json({ title: 'Invalid token', message: 'Token youre provide is invalid', code: 403 }, { status: 403 });
    }
}

export default authMiddleware