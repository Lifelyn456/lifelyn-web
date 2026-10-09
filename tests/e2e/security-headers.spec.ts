import { expect, test } from "@playwright/test";

// Asserts what next.config.ts promises, on a public page and on a protected route's redirect.
for (const path of ["/", "/login", "/dashboard"]) {
  test(`${path} is served with the security headers`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    const headers = response.headers();
    const csp = headers["content-security-policy"] ?? "";

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toMatch(/connect-src 'self' https?:\/\//);
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("same-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["permissions-policy"]).toContain("microphone=()");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
    // The framework banner is not advertised.
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}
