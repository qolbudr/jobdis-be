import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import authMiddleware from '@/app/api/middlewares/authentication';
import { cacheGet, cacheSet } from '@/lib/cache';
import {
  needsDisabilityProfile,
  recommendJobsForUser,
  type JobRecommendation,
} from '@/lib/recommendations';

/**
 * Mobile-facing endpoint used by the home screen.
 *
 * GET /api/recommendations?limit=10
 * Header: Authorization: <jwt>
 *
 * Returns job vacancies ranked for the logged-in user based on the disability
 * complaint captured at registration. Results are cached per user (24h).
 */

const CACHE_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

export async function GET(req: NextRequest) {
  try {
    const authResponse = authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const token = req.headers.get('authorization');
    const decoded = jwt.decode(token!) as { [key: string]: unknown } | null;
    const userId = typeof decoded?.id === 'string' ? Number.parseInt(decoded.id, 10) : Number(decoded?.id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ title: 'Invalid token', message: 'Token has no user id', code: 403 }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const requested = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_LIMIT) : DEFAULT_LIMIT;

    // Onboarding gate: existing users who registered before this feature have no
    // disability profile yet. Ask the app to collect it before showing the home
    // screen. 409 lets the client distinguish this from an auth/validation error.
    if (await needsDisabilityProfile(userId)) {
      return NextResponse.json(
        {
          title: 'Disability profile required',
          message: 'Lengkapi keluhan disabilitas Anda terlebih dahulu untuk mendapatkan rekomendasi.',
          code: 409,
          needsDisabilityProfile: true,
        },
        { status: 409 },
      );
    }

    const cacheKey = `rec:user:${userId}:limit:${limit}`;
    const cached = cacheGet<JobRecommendation[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'x-cache': 'HIT' } });
    }

    const recommendations = await recommendJobsForUser(userId, limit);
    if (recommendations.length > 0) cacheSet(cacheKey, recommendations, CACHE_TTL_SECONDS);

    return NextResponse.json(recommendations, { headers: { 'x-cache': 'MISS' } });
  } catch (error) {
    console.error('[recommendations] failed', error);
    return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
  }
}
