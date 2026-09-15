import { PatientSummary } from "@/components/clinician/patient-summary";
export default async function Page({ params }: { params: Promise<{ patientId: string }> }) { const { patientId } = await params; return <PatientSummary patientId={patientId} />; }
