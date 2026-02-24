import { describe, it, expect } from 'vitest';
import { InMemoryQueue } from '../queue.js';

describe('InMemoryQueue', () => {
  it('enqueues and processes a job', async () => {
    const queue = new InMemoryQueue();
    queue.registerHandler('test', async (payload) => `processed: ${payload}`);

    const job = queue.enqueue('test', 'hello');
    expect(job.status).toBe('pending');
    expect(queue.getPendingCount()).toBe(1);

    const processed = await queue.processNext();
    expect(processed).toBeDefined();
    expect(processed!.status).toBe('completed');
    expect(processed!.result).toBe('processed: hello');
    expect(queue.getPendingCount()).toBe(0);
  });

  it('returns null when no pending jobs', async () => {
    const queue = new InMemoryQueue();
    expect(await queue.processNext()).toBeNull();
  });

  it('handles job failures', async () => {
    const queue = new InMemoryQueue();
    queue.registerHandler('fail', async () => {
      throw new Error('boom');
    });

    queue.enqueue('fail', {});
    const processed = await queue.processNext();
    expect(processed!.status).toBe('failed');
    expect(processed!.error).toBe('boom');
  });

  it('fails jobs with no handler', async () => {
    const queue = new InMemoryQueue();
    queue.enqueue('unknown', {});
    const processed = await queue.processNext();
    expect(processed!.status).toBe('failed');
    expect(processed!.error).toContain('No handler');
  });

  it('retrieves jobs by id', () => {
    const queue = new InMemoryQueue();
    const job = queue.enqueue('test', 'data');
    expect(queue.getJob(job.id)).toBeDefined();
    expect(queue.getJob('nonexistent')).toBeUndefined();
  });
});
