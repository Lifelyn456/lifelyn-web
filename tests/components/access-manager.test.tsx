// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessManager } from "@/components/consent/access-manager";
import { api } from "@/lib/api/client";
import type { AccessRequest, ConsentGrant } from "@/lib/api/generated/types";
import { renderWithQuery } from "./test-utils";

vi.mock("@/lib/api/client", () => ({
  api: {
    consent: {
      accessRequests: vi.fn(),
      grants: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      revoke: vi.fn(),
    },
  },
}));

const pendingRequest: AccessRequest = {
  id: "req-1",
  status: "PENDING",
  expiresAt: "2026-01-01T00:00:00Z",
  requestedScopeJson: {
    scope: { actions: ["read"], resourceClasses: ["records"] },
    purpose: "Annual checkup",
  },
  requester: {
    displayName: "Dr. Rivera",
    providerType: "Physician",
    verificationStatus: "VERIFIED",
  },
};

const activeGrant: ConsentGrant = {
  id: "grant-1",
  status: "ACTIVE",
  scope: { actions: ["read"], resourceClasses: ["records"] },
  startsAt: "2025-01-01T00:00:00Z",
  expiresAt: "2026-01-01T00:00:00Z",
};

describe("AccessManager", () => {
  beforeEach(() => {
    vi.mocked(api.consent.accessRequests).mockResolvedValue([pendingRequest]);
    vi.mocked(api.consent.grants).mockResolvedValue([activeGrant]);
    vi.mocked(api.consent.approve).mockResolvedValue({ ...activeGrant, id: "grant-2" });
    vi.mocked(api.consent.reject).mockResolvedValue({ status: "REJECTED" });
    vi.mocked(api.consent.revoke).mockResolvedValue({
      id: activeGrant.id,
      status: "REVOKED",
      futureAccessBlocked: true,
    });
  });

  it("shows the pending request and approves it with the exact requested scope", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccessManager />);

    expect(await screen.findByText("Dr. Rivera")).toBeInTheDocument();
    expect(screen.getByText("Annual checkup")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve exact request" }));

    await waitFor(() =>
      expect(api.consent.approve).toHaveBeenCalledWith("req-1", {
        scope: pendingRequest.requestedScopeJson.scope,
        expiresAt: pendingRequest.expiresAt,
      }),
    );
  });

  it("rejects a pending request", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccessManager />);

    await user.click(await screen.findByRole("button", { name: "Reject" }));

    await waitFor(() => expect(api.consent.reject).toHaveBeenCalledWith("req-1"));
  });

  it("revokes an active grant and blocks future access immediately", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccessManager />);

    const revokeButton = await screen.findByRole("button", { name: "Revoke" });
    await user.click(revokeButton);

    await waitFor(() => expect(api.consent.revoke).toHaveBeenCalledWith("grant-1"));
  });

  it("shows an empty state when there are no pending requests", async () => {
    vi.mocked(api.consent.accessRequests).mockResolvedValue([]);
    renderWithQuery(<AccessManager />);

    expect(await screen.findByText("No pending requests")).toBeInTheDocument();
  });
});
