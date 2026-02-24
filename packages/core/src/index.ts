// Database
export { createDatabase, runMigrations } from './db/client.js';

// Repository interfaces
export type {
  Repository,
  TeacherRepository,
  ClassRepository,
  RequestRepository,
  ArtifactRepository,
  PlanGraphRepository,
  AttachmentRepository,
} from './repository/interfaces.js';

// SQLite implementations
export { SqliteTeacherRepository } from './repository/sqlite-teacher.js';
export { SqliteClassRepository } from './repository/sqlite-class.js';
export { SqliteRequestRepository } from './repository/sqlite-request.js';
export { SqliteArtifactRepository } from './repository/sqlite-artifact.js';
export { SqlitePlanGraphRepository } from './repository/sqlite-plan-graph.js';
export { SqliteAttachmentRepository } from './repository/sqlite-attachment.js';

// Service interfaces
export type {
  IntakeService,
  AttachmentInput,
  PlanningService,
  ContentAssemblyService,
  DeliveryService,
  PolicyService,
} from './services/interfaces.js';

// AI Provider
export type { AIProvider, AIRequest, AIResponse } from './services/ai-provider.js';
export { MockAIProvider } from './services/mock-ai-provider.js';

// Service implementations
export { DefaultIntakeService, classifyIntent } from './services/intake-service.js';
export { DefaultPlanningService } from './services/planning-service.js';
export { DefaultContentAssemblyService } from './services/content-assembly-service.js';
export { DefaultPolicyService } from './services/policy-service.js';
export { DefaultDeliveryService } from './services/delivery-service.js';
export type { ExportResult } from './services/delivery-service.js';

// Service factory
export { createServices, createRepositories } from './services/create-services.js';
export type { ServiceContainer, Repositories } from './services/create-services.js';

// Template initialization
export { initTemplates } from './services/init-templates.js';
