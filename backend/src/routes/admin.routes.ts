import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Admin seed endpoint - REMOVE IN PRODUCTION or add proper auth!
router.post('/seed-categories', async (_req: Request, res: Response) => {
  try {
    console.log('🌱 Starting category seeding...');

    // Run the seed script
    const { stdout, stderr } = await execAsync('cd /app/backend && npx tsx prisma/seed-categories.ts');

    console.log('Seed output:', stdout);
    if (stderr) console.error('Seed errors:', stderr);

    res.json({
      success: true,
      message: 'Categories seeded successfully!',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stdout || error.stderr,
    });
  }
});

// Health check for admin endpoints
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Admin endpoints are active',
  });
});

export default router;
