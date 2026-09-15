import { AppShell } from "@/components/app-shell";
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <AppShell requiredRole="PATIENT">{children}</AppShell>;
}
