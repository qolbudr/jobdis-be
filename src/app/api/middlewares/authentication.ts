const jwt = require('jsonwebtoken');

import { NextApiRequest } from 'next'
import { NextRequest, NextResponse } from 'next/server';

type Middleware = (req: NextRequest) => NextResponse

const authMiddleware: Middleware = (req) => {
    const token = req.headers.get('authorization')

    if (!token) {
        return NextResponse.json({ message: 'Access denied, token missing' }, { status: 401 });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return NextResponse.next() // Proceed
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }
}

export default authMiddleware