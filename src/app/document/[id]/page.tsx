import Link from "next/link";
import DocumentWorkspace from "@/components/DocumentWorkspace";
import DocumentHeader from "@/components/DocumentHeader";
import AuthGuard from "@/components/AuthGuard";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  
  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header bar */}
        <DocumentHeader documentId={params.id} />

        {/* Main content grid area */}
        <div className="flex-1 overflow-hidden p-4 flex justify-center bg-gray-50 min-h-0">
          <div className="w-full h-full flex justify-center min-h-0">
             <DocumentWorkspace documentId={params.id} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
