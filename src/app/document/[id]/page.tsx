import Link from "next/link";
import Spreadsheet from "@/components/Spreadsheet";
import DocumentHeader from "@/components/DocumentHeader";
import AuthGuard from "@/components/AuthGuard";
import PresenceBar from "@/components/PresenceBar";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header bar */}
        <DocumentHeader documentId={params.id} />

        {/* Main content grid area */}
        <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50">
          <div className="max-w-max w-full">
             <PresenceBar documentId={params.id} />
             <Spreadsheet documentId={params.id} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
