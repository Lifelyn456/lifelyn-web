/**
 * Request/response types for the lifelyn-api contract.
 *
 * lifelyn-api validates every route with Zod rather than nestjs/swagger DTOs, so its
 * auto-generated OpenAPI document carries no schema detail (no request/response bodies) —
 * running openapi-typescript against it today would produce near-empty types. Until that repo
 * registers its Zod schemas with the OpenAPI document (e.g. via zod-to-openapi) so real codegen
 * is possible, these types are maintained by hand against lifelyn-api's actual Zod schemas and
 * Prisma models (see ../../../../../Lifelyn-api/prisma/schema.prisma and src/modules/*\/*.controller.ts
 * in that sibling repo) and must be kept in sync with them by hand.
 */

export type Role = "PATIENT" | "CLINICIAN";

export type PatientProfile = {
  id: string;
  displayName: string;
  emergencyModeEnabled: boolean;
};

export type ProviderProfile = {
  id: string;
  displayName: string;
  providerType: string;
  verificationStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  verifiedAt?: string | null;
};

export type Account = {
  id: string;
  wallet: string;
  email?: string;
  role: Role;
  status: string;
  mfaState: string;
  patient?: PatientProfile | null;
  provider?: ProviderProfile | null;
};

export type RecordVersionSummary = {
  id: string;
  versionNo: number;
  sha256: string;
  sizeBytes: number;
  createdAt: string;
};

export type RecordSummary = {
  id: string;
  recordType: string;
  sourceType: string;
  originalFilename: string;
  mimeType: string;
  status: string;
  createdAt: string;
  versions: RecordVersionSummary[];
};

export type RecordDetail = RecordSummary & { sourceUrl: string };

export type SourceCitationRef = {
  id: string;
  recordId: string;
  recordVersionId: string;
  page?: number | null;
  section?: string | null;
  charStart?: number | null;
  charEnd?: number | null;
};

export type TimelineEvent = {
  id: string;
  eventType: string;
  occurredAt: string;
  certainty: "confirmed" | "probable" | "possible" | "unknown";
  sourceKind: "provider" | "patient" | "import";
  selfReported: boolean;
  interpretation: { display?: string };
  correction?: unknown;
  reviewStatus: "PENDING_REVIEW" | "ACCEPTED" | "CORRECTED" | "REJECTED";
  citations: SourceCitationRef[];
};

export type ObservationTrend = {
  name: string;
  values: Array<{
    valueNumeric?: string;
    valueText?: string;
    unit?: string;
    refLow?: string;
    refHigh?: string;
    observedAt: string;
  }>;
};

export type ConsentScope = { actions: string[]; resourceClasses: string[]; recordIds?: string[] };

export type AccessRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  expiresAt: string;
  requestedScopeJson: { scope: ConsentScope; purpose: string };
  requester: { displayName: string; providerType: string; verificationStatus: string };
};

export type ConsentGrant = {
  id: string;
  status: "PENDING_CHAIN" | "ACTIVE" | "EXPIRED" | "REVOKED" | "CHAIN_FAILED";
  scope: ConsentScope;
  startsAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  stellarTxHash?: string | null;
};

export type AccessEvent = {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  purpose?: string | null;
  requestId: string;
  occurredAt: string;
  actor: { id: string; role: string; provider?: { displayName: string } | null };
};

export type AskConversation = { id: string; patientId: string; purpose: string };

export type AskClaimCitation = {
  record_version_id: string;
  record_id?: string;
  page: number;
  span_id: string;
  relevance_score: number;
};

export type AskClaim = {
  text: string;
  support_status: "SUPPORTED";
  citations: AskClaimCitation[];
  occurred_at?: string | null;
  source_kind?: "provider" | "patient" | "import" | null;
  fact_id?: string | null;
  provenance: "record" | "patient-correction";
};

export type AskAnswer = {
  answer: string;
  insufficient_evidence: boolean;
  safety_notice: string;
  conflicts: string[];
  claims: AskClaim[];
};

export type Organization = {
  id: string;
  name: string;
  type: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

export type OrganizationMembership = {
  id: string;
  organizationId: string;
  providerId: string;
  role: "ADMIN" | "MEMBER";
  status: "ACTIVE" | "SUSPENDED";
  provider: { id: string; displayName: string; providerType: string; verificationStatus: string };
};

export type ApiError = { error: { code: string; message: string; requestId: string } };
