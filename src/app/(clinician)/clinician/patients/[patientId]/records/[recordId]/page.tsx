import { RecordDetail } from "@/components/records/record-detail";
export default async function Page({ params }: { params: Promise<{ patientId: string; recordId: string }> }) { const { patientId, recordId } = await params; return <RecordDetail id={recordId} patientId={patientId} backHref={`/clinician/patients/${patientId}`} />; }
