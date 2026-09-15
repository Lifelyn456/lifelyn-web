import { RecordDetail } from "@/components/records/record-detail";
export default async function Page({ params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;
  return <RecordDetail id={recordId} />;
}
