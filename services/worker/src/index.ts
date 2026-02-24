import { InMemoryQueue } from './queue.js';

export { InMemoryQueue } from './queue.js';
export type { Job, JobHandler } from './queue.js';
export { createGeneratePackageHandler } from './handlers/generate-package.js';
export type { GeneratePackagePayload } from './handlers/generate-package.js';

const queue = new InMemoryQueue();

async function startWorker(): Promise<void> {
  console.log('[Worker] TeachAssist Worker started');
  console.log('[Worker] Waiting for jobs...');

  const pollInterval = Number(process.env.POLL_INTERVAL_MS) || 1000;

  const tick = async () => {
    const job = await queue.processNext();
    if (job) {
      console.log(`[Worker] Processed job ${job.id} (${job.type}): ${job.status}`);
    }
  };

  setInterval(tick, pollInterval);
}

// Only start if run directly
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  startWorker();
}
