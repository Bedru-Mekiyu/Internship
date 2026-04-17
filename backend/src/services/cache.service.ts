import { createHash } from 'crypto';
import Redis from 'ioredis';
import { logWarn } from '../utils/logger';

const CATALOG_VER_KEY = 'lms:catalog:ver';
const KEY_PREFIX = 'lms:course:list';

let shared: Redis | null | undefined;

const getRedis = (): Redis | null => {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (shared === undefined) {
    try {
      shared = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: false,
      });
      shared.on('error', () => {
        /* fallback: miss cache */
      });
    } catch {
      shared = null;
    }
  }
  return shared;
};

const parseTtlSec = (): number => {
  const raw = process.env.CACHE_COURSE_LIST_TTL_SEC;
  const n = raw ? Number.parseInt(raw, 10) : 45;
  return Number.isFinite(n) && n >= 5 && n <= 600 ? n : 45;
};

export const bumpCourseCatalogCacheVersion = async (): Promise<void> => {
  const r = getRedis();
  if (!r) return;
  try {
    await r.incr(CATALOG_VER_KEY);
  } catch {
    /* ignore */
  }
};

const getCatalogVersion = async (): Promise<string> => {
  const r = getRedis();
  if (!r) return '0';
  try {
    const v = await r.get(CATALOG_VER_KEY);
    return v || '0';
  } catch {
    return '0';
  }
};

const stableKey = (payload: Record<string, unknown>): string =>
  createHash('sha256').update(JSON.stringify(payload)).digest('hex');

export type CourseListCacheInput = {
  filters: Record<string, unknown>;
  paginated: boolean;
  page: number;
  limit: number;
};

export const getCachedCourseListJson = async (input: CourseListCacheInput): Promise<string | null> => {
  const r = getRedis();
  if (!r) return null;
  const ver = await getCatalogVersion();
  const h = stableKey(input);
  const key = `${KEY_PREFIX}:v${ver}:${h}`;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
};

export const setCachedCourseListJson = async (input: CourseListCacheInput, json: string): Promise<void> => {
  const r = getRedis();
  if (!r) return;
  const ver = await getCatalogVersion();
  const h = stableKey(input);
  const key = `${KEY_PREFIX}:v${ver}:${h}`;
  const ttl = parseTtlSec();
  try {
    await r.set(key, json, 'EX', ttl);
  } catch (e) {
    logWarn('cache_set_failed', { key, error: String(e) });
  }
};
