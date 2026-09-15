import { apiRequest } from "@/lib/auth";
import type {
  Account,
  AccessEvent,
  AccessRequest,
  AskAnswer,
  AskConversation,
  ConsentGrant,
  ConsentScope,
  Organization,
  OrganizationMembership,
  ObservationTrend,
  RecordDetail,
  RecordSummary,
  TimelineEvent,
} from "./generated/types";

const post = <T>(path: string, body?: unknown) =>
  apiRequest<T>(path, {
    method: "POST",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
const patch = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) });

/** Typed wrappers over the real lifelyn-api routes — the single source of truth for
 * request/response shapes (see ./generated/types.ts), replacing per-component inline
 * type declarations. Built on the fetch primitives in @/lib/auth (session/token handling
 * lives there; this module owns per-resource request shapes). */
export const api = {
  me: () => apiRequest<Account>("/me"),

  records: {
    list: (patientId = "me") => apiRequest<RecordSummary[]>(`/patients/${patientId}/records`),
    detail: (patientId: string, recordId: string) =>
      apiRequest<RecordDetail>(`/patients/${patientId}/records/${recordId}`),
    createUploadUrl: (input: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      recordType?: string;
      sourceType?: "UPLOAD" | "PATIENT_ENTERED";
    }) =>
      post<{
        recordId: string;
        objectKey: string;
        uploadUrl: string;
        expiresIn: number;
        requiredHeaders: Record<string, string>;
        next: string;
      }>("/patients/me/records/upload-url", input),
    finalize: (input: { recordId: string; objectKey: string }) =>
      post<{ recordId: string; recordVersionId: string; status: string; sha256: string }>(
        "/patients/me/records/finalize",
        input,
      ),
    reprocess: (patientId: string, recordId: string) =>
      post<{ status: string; idempotencyKey: string }>(
        `/patients/${patientId}/records/${recordId}/reprocess`,
      ),
    integrityCheck: (patientId: string, recordId: string) =>
      post<{ status: string; idempotencyKey: string }>(
        `/patients/${patientId}/records/${recordId}/integrity-check`,
      ),
  },

  timeline: {
    list: (patientId = "me") => apiRequest<TimelineEvent[]>(`/patients/${patientId}/timeline`),
    trends: (patientId = "me") =>
      apiRequest<ObservationTrend[]>(`/patients/${patientId}/observations/trends`),
    correct: (
      eventId: string,
      input: {
        reason: string;
        fields: Record<string, string | number | boolean | null>;
        reviewStatus: "ACCEPTED" | "CORRECTED" | "REJECTED";
      },
    ) => patch<TimelineEvent>(`/patients/me/events/${eventId}`, input),
  },

  consent: {
    accessRequests: () => apiRequest<AccessRequest[]>("/patients/me/access-requests"),
    approve: (
      requestId: string,
      input: { scope: ConsentScope; expiresAt: string; startsAt?: string },
    ) => post<ConsentGrant>(`/patients/me/access-requests/${requestId}/approve`, input),
    reject: (requestId: string) =>
      post<{ status: string }>(`/patients/me/access-requests/${requestId}/reject`),
    requestAccess: (
      patientId: string,
      input: { scope: ConsentScope; expiresAt: string; purpose: string },
    ) => post(`/patients/${patientId}/access-requests`, input),
    grants: () => apiRequest<ConsentGrant[]>("/patients/me/consents"),
    revoke: (grantId: string) =>
      post<{ id: string; status: string; futureAccessBlocked: boolean }>(
        `/patients/me/consents/${grantId}/revoke`,
      ),
  },

  ask: {
    createConversation: (patientId: string, purpose: string) =>
      post<AskConversation>(`/patients/${patientId}/conversations`, { purpose }),
    ask: (patientId: string, conversationId: string, question: string) =>
      post<AskAnswer>(`/patients/${patientId}/conversations/${conversationId}/messages`, {
        question,
      }),
  },

  audit: {
    list: () => apiRequest<AccessEvent[]>("/patients/me/audit"),
  },

  organizations: {
    create: (input: { name: string; type: string }) => post<Organization>("/organizations", input),
    detail: (organizationId: string) =>
      apiRequest<Organization>(`/organizations/${organizationId}`),
    members: (organizationId: string) =>
      apiRequest<OrganizationMembership[]>(`/organizations/${organizationId}/members`),
    addMember: (organizationId: string, input: { providerId: string; role?: "ADMIN" | "MEMBER" }) =>
      post<OrganizationMembership>(`/organizations/${organizationId}/members`, input),
  },
};
