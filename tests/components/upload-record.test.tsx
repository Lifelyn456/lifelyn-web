// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadRecord } from "@/components/records/upload-record";
import { api } from "@/lib/api/client";
import { MAX_RECORD_BYTES, validateRecordFile } from "@/lib/upload-validation";
import { renderWithQuery } from "./test-utils";

vi.mock("@/lib/api/client", () => ({
  api: { records: { createUploadUrl: vi.fn(), finalize: vi.fn() } },
}));

const slot = {
  recordId: "record-1",
  objectKey: "staging/record-1",
  uploadUrl: "https://storage.invalid/upload",
  expiresIn: 300,
  requiredHeaders: { "content-type": "application/pdf" },
  next: "finalize",
};

function fileOf(name: string, type: string, size?: number) {
  const file = new File(["synthetic"], name, { type });
  if (size !== undefined) Object.defineProperty(file, "size", { value: size });
  return file;
}

// applyAccept: false simulates a user who bypasses the input's accept attribute (drag and drop,
// or a renamed file), which is exactly what client-side validation exists to catch.
const user = () => userEvent.setup({ applyAccept: false });

describe("validateRecordFile", () => {
  it.each([
    ["a PDF", fileOf("scan.pdf", "application/pdf")],
    ["a PNG", fileOf("scan.png", "image/png")],
    ["a JPEG", fileOf("scan.jpg", "image/jpeg")],
    ["a file exactly at the limit", fileOf("big.pdf", "application/pdf", MAX_RECORD_BYTES)],
  ])("accepts %s", (_label, file) => {
    expect(validateRecordFile(file)).toBeNull();
  });

  it.each([
    ["a text file", fileOf("notes.txt", "text/plain"), /Only PDF, PNG, or JPEG/],
    ["an executable", fileOf("run.exe", "application/octet-stream"), /Only PDF, PNG, or JPEG/],
    ["a file with no type", fileOf("mystery", ""), /Only PDF, PNG, or JPEG/],
    ["an empty file", fileOf("empty.pdf", "application/pdf", 0), /empty/],
    [
      "a file one byte over the limit",
      fileOf("huge.pdf", "application/pdf", MAX_RECORD_BYTES + 1),
      /limit is 25 MB/,
    ],
    [
      "a very long file name",
      fileOf(`${"a".repeat(256)}.pdf`, "application/pdf"),
      /between 1 and 255/,
    ],
  ])("rejects %s", (_label, file, message) => {
    expect(validateRecordFile(file)).toMatch(message);
  });
});

describe("UploadRecord", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.mocked(api.records.createUploadUrl).mockResolvedValue(slot);
    vi.mocked(api.records.finalize).mockResolvedValue({
      recordId: "record-1",
      recordVersionId: "v1",
      status: "QUEUED",
      sha256: "a".repeat(64),
    });
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  const chooseFile = (file: File) =>
    user().upload(screen.getByLabelText(/Medical PDF or image/), file);
  const uploadButton = () => screen.getByRole("button", { name: /Upload and process/ });

  it("starts with the upload button disabled", () => {
    renderWithQuery(<UploadRecord />);
    expect(uploadButton()).toBeDisabled();
  });

  it.each([
    [
      "a file type that is not allowed",
      fileOf("notes.txt", "text/plain"),
      /Only PDF, PNG, or JPEG/,
    ],
    ["an empty file", fileOf("empty.pdf", "application/pdf", 0), /empty/],
    [
      "a file over 25 MB",
      fileOf("huge.pdf", "application/pdf", MAX_RECORD_BYTES + 1),
      /limit is 25 MB/,
    ],
  ])("shows a clear message for %s and never calls the API", async (_label, file, message) => {
    renderWithQuery(<UploadRecord />);
    await chooseFile(file);
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(uploadButton()).toBeDisabled();
    expect(api.records.createUploadUrl).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears the message when a valid file replaces an invalid one", async () => {
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("notes.txt", "text/plain"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(uploadButton()).toBeEnabled();
  });

  it("uploads in order: request a slot, send to storage, finalize, then report success", async () => {
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await user().click(uploadButton());
    expect(await screen.findByRole("status")).toHaveTextContent("Record secured and queued");
    expect(api.records.createUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "scan.pdf",
        mimeType: "application/pdf",
        recordType: "OTHER",
        sourceType: "UPLOAD",
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      slot.uploadUrl,
      expect.objectContaining({ method: "PUT", headers: slot.requiredHeaders }),
    );
    expect(api.records.finalize).toHaveBeenCalledWith({
      recordId: "record-1",
      objectKey: "staging/record-1",
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sends the record type the user chose", async () => {
    renderWithQuery(<UploadRecord />);
    await user().selectOptions(screen.getByLabelText(/Record type/), "LAB_RESULT");
    await chooseFile(fileOf("labs.pdf", "application/pdf"));
    await user().click(uploadButton());
    await screen.findByRole("status");
    expect(api.records.createUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ recordType: "LAB_RESULT" }),
    );
  });

  it("fails closed when the API refuses to create an upload slot", async () => {
    vi.mocked(api.records.createUploadUrl).mockRejectedValue(
      new Error("Private object storage is not configured."),
    );
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await user().click(uploadButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Private object storage is not configured.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(api.records.finalize).not.toHaveBeenCalled();
    expect(screen.queryByText(/Record secured/)).not.toBeInTheDocument();
  });

  it("does not finalize when storage rejects the upload", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await user().click(uploadButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Object storage rejected the upload.",
    );
    expect(api.records.finalize).not.toHaveBeenCalled();
    expect(screen.queryByText(/Record secured/)).not.toBeInTheDocument();
  });

  it("shows an explicit error and no success when finalizing fails (for example the malware scan)", async () => {
    vi.mocked(api.records.finalize).mockRejectedValue(
      new Error("The uploaded file did not pass malware scanning."),
    );
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await user().click(uploadButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("did not pass malware scanning");
    expect(screen.queryByText(/Record secured/)).not.toBeInTheDocument();
    // The file stays selected, so the user can retry without choosing it again.
    expect(uploadButton()).toBeEnabled();
  });

  it("uses a generic message when the failure is not an Error", async () => {
    vi.mocked(api.records.createUploadUrl).mockRejectedValue("boom");
    renderWithQuery(<UploadRecord />);
    await chooseFile(fileOf("scan.pdf", "application/pdf"));
    await user().click(uploadButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Upload failed.");
  });
});
