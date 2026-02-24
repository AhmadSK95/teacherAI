import type Database from 'better-sqlite3';
import type { AIProvider } from './ai-provider.js';
import type { IntakeService, PlanningService, ContentAssemblyService, DeliveryService, PolicyService } from './interfaces.js';
import type { TeacherRepository, ClassRepository, RequestRepository, ArtifactRepository, PlanGraphRepository } from '../repository/interfaces.js';
import { SqliteTeacherRepository } from '../repository/sqlite-teacher.js';
import { SqliteClassRepository } from '../repository/sqlite-class.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { DefaultIntakeService } from './intake-service.js';
import { DefaultPlanningService } from './planning-service.js';
import { DefaultContentAssemblyService } from './content-assembly-service.js';
import { DefaultPolicyService } from './policy-service.js';
import { DefaultDeliveryService } from './delivery-service.js';
import { MockAIProvider } from './mock-ai-provider.js';

export interface Repositories {
  teachers: TeacherRepository;
  classes: ClassRepository;
  requests: RequestRepository;
  artifacts: ArtifactRepository;
  planGraphs: PlanGraphRepository;
}

export interface ServiceContainer {
  repos: Repositories;
  intake: IntakeService;
  planning: PlanningService;
  contentAssembly: ContentAssemblyService;
  delivery: DeliveryService;
  policy: PolicyService;
  aiProvider: AIProvider;
}

export function createRepositories(db: Database.Database): Repositories {
  return {
    teachers: new SqliteTeacherRepository(db),
    classes: new SqliteClassRepository(db),
    requests: new SqliteRequestRepository(db),
    artifacts: new SqliteArtifactRepository(db),
    planGraphs: new SqlitePlanGraphRepository(db),
  };
}

export function createServices(db: Database.Database, aiProvider?: AIProvider): ServiceContainer {
  const repos = createRepositories(db);
  const provider = aiProvider || new MockAIProvider();

  return {
    repos,
    intake: new DefaultIntakeService(repos.requests),
    planning: new DefaultPlanningService(repos.planGraphs),
    contentAssembly: new DefaultContentAssemblyService(provider, repos.artifacts, repos.planGraphs, repos.requests),
    delivery: new DefaultDeliveryService(repos.artifacts),
    policy: new DefaultPolicyService(repos.artifacts, repos.requests),
    aiProvider: provider,
  };
}
