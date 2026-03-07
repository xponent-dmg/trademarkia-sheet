import DocumentWorkspace from "@/components/DocumentWorkspace";
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
        {/* DocumentWorkspace owns the full layout including DocumentHeader */}
        <div className="flex-1 overflow-hidden flex justify-center bg-gray-50 min-h-0">
          <div className="w-full h-full flex justify-center min-h-0">
             <DocumentWorkspace documentId={params.id} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
