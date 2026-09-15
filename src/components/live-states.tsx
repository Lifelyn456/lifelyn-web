export function Loading() { return <section className="panel empty-state"><p role="status">Loading live data…</p></section>; }
export function Failure({ error }: { error: unknown }) { return <section className="panel empty-state"><h2>Live service unavailable</h2><p role="alert">{error instanceof Error ? error.message : "The request could not be completed."}</p></section>; }
