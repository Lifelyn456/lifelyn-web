// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecordDetail } from "@/components/records/record-detail";
import { RecordList } from "@/components/records/record-list";
import { apiBlob, apiRequest } from "@/lib/auth";
import { renderWithQuery } from "./test-utils";

vi.mock("@/lib/auth", () => ({ apiRequest: vi.fn(), apiBlob: vi.fn() }));

const detail = {
  id: "record-1",
  originalFilename: "lab-results.pdf",
  mimeType: "application/pdf",
  recordType: "LAB_RESULT",
  sourceType: "UPLOAD",
  status: "READY_FOR_REVIEW",
  sourceUrl: "/patients/me/records/record-1/source",
  versions: [
    { id: "v1", sha256: "ab".repeat(32), sizeBytes: 123456, createdAt: "2026-01-01T00:00:00Z" },
  ],
};

const summary = (id: string, name: string, status = "READY_FOR_REVIEW") => ({
  id,
  recordType: "LAB_RESULT",
  sourceType: "UPLOAD",
  originalFilename: name,
  mimeType: "application/pdf",
  status,
  createdAt: "2026-01-02T00:00:00Z",
  versions: [],
});

afterEach(() => vi.clearAllMocks());

describe("RecordList", () => {
  it("shows a loading state first", () => {
    vi.mocked(apiRequest).mockReturnValue(new Promise(() => undefined));
    renderWithQuery(<RecordList />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading live data");
  });

  it("fails closed with the API's own message when the service is unavailable", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("The API is not reachable."));
    renderWithQuery(<RecordList />);
    expect(await screen.findByRole("alert")).toHaveTextContent("The API is not reachable.");
    expect(screen.queryByText(/No records yet/)).not.toBeInTheDocument();
  });

  it("shows an empty state with a way to upload", async () => {
    vi.mocked(apiRequest).mockResolvedValue([]);
    renderWithQuery(<RecordList />);
    expect(await screen.findByText("No records yet")).toBeInTheDocument();
    expect(screen.getByText("0 live records")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload record" })).toHaveAttribute(
      "href",
      "/records/upload",
    );
  });

  it("lists each record with a link to its page and a readable status", async () => {
    vi.mocked(apiRequest).mockResolvedValue([
      summary("r1", "labs.pdf"),
      summary("r2", "xray.png", "PROCESSING_FAILED"),
    ]);
    renderWithQuery(<RecordList />);
    expect(await screen.findByText("labs.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 live records")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /labs\.pdf/ })).toHaveAttribute("href", "/records/r1");
    expect(screen.getByRole("link", { name: /xray\.png/ })).toHaveAttribute("href", "/records/r2");
    expect(screen.getByText("PROCESSING FAILED")).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/patients/me/records");
  });
});

describe("RecordDetail", () => {
  const createObjectURL = vi.fn(() => "blob:synthetic");
  const revokeObjectURL = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shows a loading state, then the record's metadata", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    renderWithQuery(<RecordDetail id="record-1" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading live data");
    expect(await screen.findByText("lab-results.pdf")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LAB RESULT" })).toBeInTheDocument();
    expect(screen.getByText("Status: READY FOR REVIEW")).toBeInTheDocument();
    expect(screen.getByText("ab".repeat(32))).toBeInTheDocument();
    expect(screen.getByText("123,456 bytes")).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/patients/me/records/record-1");
  });

  it("does not decrypt the source until the user asks for it", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    renderWithQuery(<RecordDetail id="record-1" />);
    await screen.findByText("lab-results.pdf");
    expect(screen.getByText(/decrypted only after this authorized request/)).toBeInTheDocument();
    expect(apiBlob).not.toHaveBeenCalled();
  });

  it("fails closed when the record cannot be loaded", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("You do not have access to this record."));
    renderWithQuery(<RecordDetail id="record-1" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You do not have access to this record.",
    );
    expect(screen.queryByText("lab-results.pdf")).not.toBeInTheDocument();
  });

  it("renders a PDF source in a titled frame after the user opens it", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    vi.mocked(apiBlob).mockResolvedValue(new Blob(["%PDF-"], { type: "application/pdf" }));
    renderWithQuery(<RecordDetail id="record-1" />);
    await userEvent.click(await screen.findByRole("button", { name: /Open decrypted source/ }));
    await waitFor(() =>
      expect(screen.getByTitle("lab-results.pdf")).toHaveAttribute("src", "blob:synthetic"),
    );
    expect(apiBlob).toHaveBeenCalledWith(detail.sourceUrl);
  });

  it("renders an image source with a descriptive alt text", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      ...detail,
      originalFilename: "xray.png",
      mimeType: "image/png",
    });
    vi.mocked(apiBlob).mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    renderWithQuery(<RecordDetail id="record-1" />);
    await userEvent.click(await screen.findByRole("button", { name: /Open decrypted source/ }));
    expect(await screen.findByAltText("Source record xray.png")).toHaveAttribute(
      "src",
      "blob:synthetic",
    );
  });

  it("shows why the source could not be opened instead of failing silently", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    vi.mocked(apiBlob).mockRejectedValue(new Error("The source record could not be loaded."));
    renderWithQuery(<RecordDetail id="record-1" />);
    await userEvent.click(await screen.findByRole("button", { name: /Open decrypted source/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The source record could not be loaded.",
    );
    expect(screen.queryByTitle("lab-results.pdf")).not.toBeInTheDocument();
  });

  it("releases the decrypted object URL when it is replaced or the page closes", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    vi.mocked(apiBlob).mockResolvedValue(new Blob(["%PDF-"], { type: "application/pdf" }));
    const view = renderWithQuery(<RecordDetail id="record-1" />);
    await userEvent.click(await screen.findByRole("button", { name: /Open decrypted source/ }));
    await screen.findByTitle("lab-results.pdf");
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:synthetic");
  });

  it("uses the clinician's patient id and back link when given", async () => {
    vi.mocked(apiRequest).mockResolvedValue(detail);
    renderWithQuery(
      <RecordDetail id="record-1" patientId="patient-9" backHref="/clinician/patients/patient-9" />,
    );
    expect(await screen.findByRole("link", { name: /Back to records/ })).toHaveAttribute(
      "href",
      "/clinician/patients/patient-9",
    );
    expect(apiRequest).toHaveBeenCalledWith("/patients/patient-9/records/record-1");
  });
});
