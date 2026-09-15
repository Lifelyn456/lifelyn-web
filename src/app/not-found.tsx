import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state" style={{ minHeight: "100vh" }}>
      <span className="eyebrow">LIFELYN · 404</span>
      <h1>This chapter isn’t here.</h1>
      <p>The page may have moved, or the link may be incomplete.</p>
      <Link className="button" href="/">
        Back to Lifelyn
      </Link>
    </main>
  );
}
