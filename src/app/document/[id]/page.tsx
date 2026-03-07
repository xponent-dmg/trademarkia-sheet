import Link from "next/link";
import Spreadsheet from "@/components/Spreadsheet";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
              Spreadsheet
            </h1>
            <span className="text-xs text-gray-500 font-mono">
              ID: {params.id}
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50">
        <div className="max-w-max w-full">
           <Spreadsheet documentId={params.id} />
        </div>
      </div>
    </div>
  );
}
