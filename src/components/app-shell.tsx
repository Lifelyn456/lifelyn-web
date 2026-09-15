"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, ChevronRight, Files, History, LayoutDashboard, LockKeyhole, Menu, Settings, ShieldCheck, Sparkles, Stethoscope, Upload, Users, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brand } from "./brand";
import { apiRequest, getSessionToken, setSessionToken } from "@/lib/auth";
import type { Account } from "@/types/api";

const patientLinks = [["/dashboard", "Overview", LayoutDashboard], ["/timeline", "Health timeline", Activity], ["/records", "My records", Files], ["/records/upload", "Upload record", Upload], ["/ask", "Ask my history", Sparkles], ["/access", "Access & sharing", ShieldCheck], ["/audit", "Activity log", History], ["/settings", "Settings", Settings]] as const;
const clinicianLinks = [["/clinician", "Onboarding", Stethoscope], ["/clinician/patients", "Patients", Users], ["/clinician/settings", "Security", Settings]] as const;

export function AppShell({ children, requiredRole }: { children: React.ReactNode; requiredRole: "PATIENT" | "CLINICIAN" }) {
  const router = useRouter(); const path = usePathname(); const queryClient = useQueryClient(); const [open, setOpen] = useState(false);
  const account = useQuery({ queryKey: ["me"], queryFn: () => apiRequest<Account>("/me"), enabled: Boolean(getSessionToken()), retry: false });
  useEffect(() => { if (!getSessionToken() || account.isError) router.replace("/login"); else if (account.data && account.data.role !== requiredRole) router.replace(account.data.role === "PATIENT" ? "/dashboard" : "/clinician/patients"); }, [account.data, account.isError, requiredRole, router]);
  if (!getSessionToken() || account.isPending || !account.data || account.data.role !== requiredRole) return <main className="auth-content" style={{ minHeight: "100vh" }}><p role="status">Verifying your Freighter session…</p></main>;
  const links = requiredRole === "PATIENT" ? patientLinks : clinicianLinks;
  const name = account.data.patient?.displayName ?? account.data.provider?.displayName ?? "Lifelyn account";
  return <div className="workspace">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}><div className="sidebar-brand"><Brand /><button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
      <div className="workspace-label">{requiredRole === "PATIENT" ? "YOUR HEALTH MEMORY" : "CLINICIAN WORKSPACE"}</div>
      <nav>{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={path === href || (href !== "/dashboard" && path.startsWith(`${href}/`)) ? "active" : ""}><Icon size={19} />{label}{label.includes("Ask") && <span className="nav-new">AI</span>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="ownership-note"><LockKeyhole size={18} /><strong>Consent enforced.</strong><p>Every protected request is checked by the API.</p></div><div className="profile-strip"><span className="avatar">{name.slice(0, 2).toUpperCase()}</span><div><strong>{name}</strong><span>{account.data.wallet.slice(0, 8)}…{account.data.wallet.slice(-6)}</span></div><button className="icon-button" aria-label="Sign out" onClick={() => { setSessionToken(null); queryClient.clear(); router.replace("/login"); }}><ChevronRight size={18} /></button></div></div>
    </aside>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <div className="workspace-body"><header className="workspace-header"><div><button className="icon-button mobile-close" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu /></button><span>Lifelyn</span><ChevronRight size={14} /><strong>{links.find(([href]) => path === href || path.startsWith(`${href}/`))?.[1] ?? "Workspace"}</strong></div><span className="status-pill">Live services</span></header><main className="workspace-main">{children}</main></div>
  </div>;
}
