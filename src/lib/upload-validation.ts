// These limits mirror the API's upload schema (Lifelyn-api, records.controller.ts): the API stays
// the authority and re-checks everything, but telling the user before they click saves a round
// trip and gives a clear reason instead of a generic validation error.
export const ALLOWED_RECORD_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;
export const MAX_RECORD_BYTES = 25 * 1024 * 1024;
export const MAX_FILENAME_LENGTH = 255;

/** Returns a message explaining why the file cannot be uploaded, or null if it can. */
export function validateRecordFile(file: Pick<File, "name" | "type" | "size">): string | null {
  if (!(ALLOWED_RECORD_TYPES as readonly string[]).includes(file.type)) {
    return "Only PDF, PNG, or JPEG files can be uploaded.";
  }
  if (file.size <= 0) return "This file is empty.";
  if (file.size > MAX_RECORD_BYTES) {
    return `This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The limit is 25 MB.`;
  }
  if (file.name.trim().length === 0 || file.name.length > MAX_FILENAME_LENGTH) {
    return "The file name must be between 1 and 255 characters.";
  }
  return null;
}
