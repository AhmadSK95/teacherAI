import express from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import healthRouter from './routes/health.js';
import type { ServiceContainer } from '@teachassist/core';
import type { InMemoryQueue } from '@teachassist/worker';
import { createRequestsRouter } from './routes/requests.js';
import { createArtifactsRouter } from './routes/artifacts.js';
import { createTeachersRouter } from './routes/teachers.js';
import { createClassesRouter } from './routes/classes.js';

export interface AppDependencies {
  services: ServiceContainer;
  queue: InMemoryQueue;
}

export function createApp(deps?: AppDependencies): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Routes
  app.use('/v1', healthRouter);

  if (deps) {
    app.use('/v1', createRequestsRouter(deps.services, deps.queue));
    app.use('/v1', createArtifactsRouter(deps.services));
    app.use('/v1', createTeachersRouter(deps.services));
    app.use('/v1', createClassesRouter(deps.services));
  }

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
