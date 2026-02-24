export interface Repository<T> {
  findById(id: string): T | null;
  findAll(): T[];
  create(entity: T): T;
  update(id: string, partial: Partial<T>): T | null;
  delete(id: string): boolean;
}

export interface TeacherRepository extends Repository<import('@teachassist/schemas').TeacherProfile> {
  findByEmail(email: string): import('@teachassist/schemas').TeacherProfile | null;
}

export interface ClassRepository extends Repository<import('@teachassist/schemas').ClassProfile> {
  findByTeacherId(teacherId: string): import('@teachassist/schemas').ClassProfile[];
}

export interface RequestRepository extends Repository<import('@teachassist/schemas').RequestEvent> {
  findByTeacherId(teacherId: string): import('@teachassist/schemas').RequestEvent[];
}

export interface ArtifactRepository extends Repository<import('@teachassist/schemas').ArtifactOutput> {
  findByRequestId(requestId: string): import('@teachassist/schemas').ArtifactOutput[];
}

export interface PlanGraphRepository extends Repository<import('@teachassist/schemas').PlanGraph> {
  findByRequestId(requestId: string): import('@teachassist/schemas').PlanGraph | null;
}

export interface AttachmentRepository extends Repository<import('@teachassist/schemas').AttachmentMeta> {
  findByRequestId(requestId: string): import('@teachassist/schemas').AttachmentMeta[];
}
