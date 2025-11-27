import cron from 'node-cron';
import { expireOldLocks } from '../services/inventory-lock.service';

/**
 * Lock Cleanup Job
 *
 * Automatically expires old inventory locks to prevent stale locks
 * from blocking items indefinitely.
 *
 * Runs every 5 minutes
 */
export const startLockCleanupJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[LockCleanup] Running expired lock cleanup...');
      const result = await expireOldLocks();
      console.log(`[LockCleanup] Expired ${result.expired} locks`);

      if (result.expired > 0) {
        console.log('[LockCleanup] Expired lock details:', {
          count: result.expired,
          lockIds: result.locks.map(l => l.id),
        });
      }
    } catch (error) {
      console.error('[LockCleanup] Error:', error);
    }
  });

  console.log('[LockCleanup] Job scheduled (every 5 minutes)');
};

/**
 * Run lock cleanup manually (for testing or admin operations)
 */
export const runCleanupNow = async () => {
  try {
    console.log('[LockCleanup] Running manual cleanup...');
    const result = await expireOldLocks();
    console.log(`[LockCleanup] Expired ${result.expired} locks`);
    return result;
  } catch (error) {
    console.error('[LockCleanup] Error:', error);
    throw error;
  }
};
