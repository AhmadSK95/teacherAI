export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface JobHandler<T = unknown> {
  (payload: T): Promise<unknown>;
}

export class InMemoryQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private counter = 0;

  registerHandler(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  enqueue<T>(type: string, payload: T): Job<T> {
    const id = `job_${++this.counter}`;
    const job: Job<T> = {
      id,
      type,
      payload,
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobs.set(id, job as Job);
    return job;
  }

  async processNext(): Promise<Job | null> {
    const pending = [...this.jobs.values()].find((j) => j.status === 'pending');
    if (!pending) return null;

    const handler = this.handlers.get(pending.type);
    if (!handler) {
      pending.status = 'failed';
      pending.error = `No handler registered for type: ${pending.type}`;
      return pending;
    }

    pending.status = 'running';
    try {
      pending.result = await handler(pending.payload);
      pending.status = 'completed';
      pending.completedAt = new Date();
    } catch (err) {
      pending.status = 'failed';
      pending.error = err instanceof Error ? err.message : String(err);
    }
    return pending;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getPendingCount(): number {
    return [...this.jobs.values()].filter((j) => j.status === 'pending').length;
  }
}
