import cron from 'node-cron';
import { runProactiveMatching } from '../services/smartMatch.service';

export const startBarterMatcherJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[BarterMatcher] Running proactive matching...');
      const count = await runProactiveMatching();
      console.log(`[BarterMatcher] Created ${count} notifications`);
    } catch (error) {
      console.error('[BarterMatcher] Error:', error);
    }
  });

  console.log('[BarterMatcher] Job scheduled (every 15 minutes)');
};

// Export a function to run matching manually (for testing)
export const runMatchingNow = async () => {
  try {
    console.log('[BarterMatcher] Running manual match...');
    const count = await runProactiveMatching();
    console.log(`[BarterMatcher] Created ${count} notifications`);
    return count;
  } catch (error) {
    console.error('[BarterMatcher] Error:', error);
    throw error;
  }
};
