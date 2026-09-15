import { AppShell } from "@/components/app-shell";
export default function ClinicianLayout({ children }: { children: React.ReactNode }) { return <AppShell requiredRole="CLINICIAN">{children}</AppShell>; }
