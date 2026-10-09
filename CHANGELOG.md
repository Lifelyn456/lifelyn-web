# Changelog

## Unreleased

### Fixed
- **Accessibility: colour contrast.** axe-core found WCAG 2.1 AA contrast failures on the landing, login and register pages (30 elements): muted text at 4.3:1 (shared `--muted` token), a 2.3:1 step number, and three more muted greens at 2.9 to 3.4:1. The shared token and four stray colours are darkened, with the same look. All three pages now pass.
- **Upload validation.** The upload page promised "PDF, PNG, or JPEG up to 25 MB" but only the browser's file-picker hint enforced it. The type, size (1 byte to 25 MB) and file-name limits are now checked before any request, mirroring the API's schema, with a clear message. The file input also resets after a successful upload.
- Security: upgraded Next.js to 16.3.8 and patched transitive advisories.

### Added
- Accessibility end-to-end tests (axe-core, WCAG 2.1 A and AA) for every public route, plus a keyboard check.
- Security-header end-to-end tests.
- 33 component and unit tests for upload validation, the record list and record detail (the suite grows from 16 to 49 unit tests).
- `docs/ARCHITECTURE.md`: route map, route guards, the Freighter sign-in flow, where the session lives, failure behaviour and security headers.
- MIT license.

## v0.1.0

- Patient and clinician application with Freighter-only sign-in.
