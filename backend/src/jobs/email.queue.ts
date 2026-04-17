import { Queue } from 'bullmq';
import Redis from 'ioredis';

let emailQueue: Queue | null | undefined;

/**
 * Optional async email / notification offload. Requires REDIS_URL and ENABLE_JOB_QUEUE=true.
 * Run a worker process separately (see BullMQ docs) to process jobs; this file only registers the queue.
 */
export const getEmailQueue = (): Queue | null => {
  if (emailQueue !== undefined) {
    return emailQueue;
  }
  const url = process.env.REDIS_URL?.trim();
  if (!url || process.env.ENABLE_JOB_QUEUE !== 'true') {
    emailQueue = null;
    return null;
  }
  try {
    const connection = new Redis(url, { maxRetriesPerRequest: null });
    emailQueue = new Queue('email', { connection });
    return emailQueue;
  } catch {
    emailQueue = null;
    return null;
  }
};
