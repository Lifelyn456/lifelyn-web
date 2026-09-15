import { PatientTimeline } from "@/components/clinician/patient-timeline";
export default async function Page({ params }: { params: Promise<{ patientId: string }> }) { const { patientId } = await params; return <PatientTimeline patientId={patientId} />; }
