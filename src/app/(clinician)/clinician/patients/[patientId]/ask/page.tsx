import { AskHistory } from "@/components/chat/ask-history";
export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <AskHistory patientId={patientId} clinician />;
}
