"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import type { ConsentScope } from "@/lib/api/generated/types";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";

export function AccessManager() {
  const client = useQueryClient();
  const requests = useQuery({ queryKey: ["access-requests"], queryFn: api.consent.accessRequests });
  const grants = useQuery({ queryKey: ["consents"], queryFn: api.consent.grants });
  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["access-requests"] }),
      client.invalidateQueries({ queryKey: ["consents"] }),
    ]);
  const approve = useMutation({
    mutationFn: ({
      requestId,
      scope,
      expiresAt,
    }: {
      requestId: string;
      scope: ConsentScope;
      expiresAt: string;
    }) => api.consent.approve(requestId, { scope, expiresAt }),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (requestId: string) => api.consent.reject(requestId),
    onSuccess: invalidate,
  });
  const revoke = useMutation({
    mutationFn: (grantId: string) => api.consent.revoke(grantId),
    onSuccess: invalidate,
  });
  const mutationError = approve.error ?? reject.error ?? revoke.error;
  if (requests.isPending || grants.isPending) return <Loading />;
  const error = requests.error ?? grants.error;
  if (error) return <Failure error={error} />;
  return (
    <>
      <PageHeading
        eyebrow="YOUR PERMISSION, YOUR BOUNDARIES"
        title="Access and sharing."
        description="Approve only the requested scope and expiry. Revocation blocks future API access immediately."
      />
      <section className="panel access-panel">
        <div className="panel-heading">
          <div>
            <h2>Access requests</h2>
            <p>Only verified clinicians with a current MFA assertion can submit requests.</p>
          </div>
        </div>
        {requests.data?.filter((item) => item.status === "PENDING").length ? (
          requests.data
            .filter((item) => item.status === "PENDING")
            .map((request) => (
              <article key={request.id}>
                <div className="provider-row">
                  <span className="avatar">
                    {request.requester.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h3>{request.requester.displayName}</h3>
                    <p>
                      {request.requester.providerType} · {request.requester.verificationStatus}
                    </p>
                  </div>
                  <span className="status-pill pending">Pending</span>
                </div>
                <p className="request-reason">{request.requestedScopeJson.purpose}</p>
                <div className="consent-form">
                  <fieldset>
                    <legend>Requested actions</legend>
                    {request.requestedScopeJson.scope.actions.map((action) => (
                      <span className="checkbox-row" key={action}>
                        <ShieldCheck size={15} />
                        {action}
                      </span>
                    ))}
                  </fieldset>
                  <fieldset>
                    <legend>Resource scope</legend>
                    {request.requestedScopeJson.scope.resourceClasses.map((scope) => (
                      <span className="checkbox-row" key={scope}>
                        <LockKeyhole size={15} />
                        {scope}
                      </span>
                    ))}
                  </fieldset>
                </div>
                <div className="access-actions">
                  <button
                    className="button"
                    onClick={() =>
                      approve.mutate({
                        requestId: request.id,
                        scope: request.requestedScopeJson.scope,
                        expiresAt: request.expiresAt,
                      })
                    }
                  >
                    Approve exact request
                  </button>
                  <button
                    className="button button-outline"
                    onClick={() => reject.mutate(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
        ) : (
          <div className="empty-state">
            <ShieldCheck />
            <h2>No pending requests</h2>
            <p>New verified clinician requests will appear here.</p>
          </div>
        )}
      </section>
      <section className="panel access-panel">
        <div className="panel-heading">
          <div>
            <h2>Consent grants</h2>
            <p>On-chain status and expiry are visible for every grant.</p>
          </div>
        </div>
        {grants.data?.length ? (
          grants.data.map((grant) => (
            <div className="grant-row" key={grant.id}>
              <div>
                <h3>{grant.scope.resourceClasses.join(" · ")}</h3>
                <p>{grant.scope.actions.join(" · ")}</p>
                <small>Expires {new Date(grant.expiresAt).toLocaleString()}</small>
              </div>
              <span className={`status-pill ${grant.status === "ACTIVE" ? "" : "pending"}`}>
                {grant.status.replaceAll("_", " ")}
              </span>
              {grant.status !== "REVOKED" && (
                <button className="danger-button" onClick={() => revoke.mutate(grant.id)}>
                  Revoke
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <LockKeyhole />
            <p>No consent grants.</p>
          </div>
        )}
      </section>
      {mutationError && (
        <p className="error-message" role="alert">
          {mutationError.message}
        </p>
      )}
    </>
  );
}
