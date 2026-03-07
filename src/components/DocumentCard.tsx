import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { DocumentData } from "@/lib/firestore";

interface DocumentCardProps {
  document: DocumentData;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp || !timestamp.toDate) return "Recently updated"; // Fallback for newly created docs where timestamp hasn't synced back yet
  
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <Link 
      href={`/document/${document.id}`}
      className="block group relative"
    >
      <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all bg-white flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 md:group-hover:text-blue-600 transition-colors pr-2">
            {document.title}
          </h3>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(document.id, e);
              }}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors flex-shrink-0 -mr-2 -mt-2"
              title="Delete spreadsheet"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mt-4">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Opened {formatTimestamp(document.updatedAt)}
        </div>
      </div>
    </Link>
  );
}
