import type { PolicyService } from './interfaces.js';
import type { ArtifactRepository, RequestRepository } from '../repository/interfaces.js';

// PII patterns for deterministic detection
const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,                         // SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,                  // Phone number
  /\b\d{1,5}\s\w+\s(?:St|Ave|Blvd|Dr|Rd|Ln|Way)\b/i, // Street address
];

// High-risk intents that require explicit teacher approval
const HIGH_RISK_INTENTS = ['iep_support'];

// High-risk keywords in content
const HIGH_RISK_KEYWORDS = ['iep', 'individualized education', 'special education', 'sped', '504 plan', 'disability', 'accommodation plan'];

export class DefaultPolicyService implements PolicyService {
  constructor(
    private artifactRepo: ArtifactRepository,
    private requestRepo: RequestRepository,
  ) {}

  async checkCompliance(artifactId: string): Promise<{ compliant: boolean; violations: string[] }> {
    const artifact = this.artifactRepo.findById(artifactId);
    if (!artifact) {
      return { compliant: false, violations: ['Artifact not found'] };
    }

    const violations: string[] = [];

    // Check for PII in content
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(artifact.content)) {
        violations.push(`PII detected: content matches pattern ${pattern.source}`);
      }
    }

    return { compliant: violations.length === 0, violations };
  }

  async requiresApproval(artifactId: string): Promise<boolean> {
    const artifact = this.artifactRepo.findById(artifactId);
    if (!artifact) return false;

    const request = this.requestRepo.findById(artifact.request_id);
    if (!request) return false;

    // Check if the request intent is high-risk
    if (HIGH_RISK_INTENTS.includes(request.inferred_intent)) {
      return true;
    }

    // Check if the content contains high-risk keywords
    const lowerContent = artifact.content.toLowerCase();
    return HIGH_RISK_KEYWORDS.some((kw) => lowerContent.includes(kw));
  }
}
