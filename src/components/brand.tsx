import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Lifelyn home"
    >
      <img src="/logo.png" alt="" />
      <span>
        lifelyn<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
