import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

import { publishDueScheduledBlogs } from '@/app/api/blogs/blogs-db';
import { env } from '@/config/env';
import { publishScheduledBlogsSchema } from '@/features/blogs/schema';
import type { ApiResponse } from '@/types/api';

type PublishScheduledResponse = {
  scanned: number;
  published: number;
  now: string;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

async function runPublish(
  now: string
): Promise<NextResponse<ApiResponse<PublishScheduledResponse>>> {
  try {
    console.log(`Publishing scheduled blogs at ${now}`);
    const result = await publishDueScheduledBlogs(now);

    return response({
      success: true,
      data: {
        scanned: result.scanned,
        published: result.published,
        now
      }
    });
  } catch {
    return response(
      {
        success: false,
        error: 'Could not publish scheduled blogs at this time.'
      },
      500
    );
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<PublishScheduledResponse>>> {
  console.log('Received request to publish scheduled blogs');

  return runPublish(new Date().toISOString());
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<PublishScheduledResponse>>> {
  const expectedSecret = env.BLOG_SCHEDULER_SECRET;
  if (!expectedSecret) {
    return response(
      {
        success: false,
        error: 'Scheduler is not configured.'
      },
      500
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = publishScheduledBlogsSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (!constantTimeEqual(parsed.data.keySecret, expectedSecret)) {
    return response(
      {
        success: false,
        error: 'Unauthorized.'
      },
      401
    );
  }

  return runPublish(new Date().toISOString());
}
