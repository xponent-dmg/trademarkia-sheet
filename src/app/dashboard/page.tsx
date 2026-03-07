"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createDocument, deleteDocument, DocumentData } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import DocumentCard from "@/components/DocumentCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        // Handle unauthenticated user if necessary, e.g., redirect to login
        router.push("/");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for documents
    // Note: We remove orderBy from the query to bypass composite index building delays.
    // We will do the sorting locally instead.
    const q = query(
      collection(db, "documents"),
      where("createdBy", "==", user.uid)
    );

    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as DocumentData;
      });

      // Sort locally: newest first (descending by updatedAt)
      docs.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load documents in onSnapshot:", error);
      setLoading(false);
    });

    return () => unsubscribeDocs();
  }, [user]);

  const handleCreateDocument = async () => {
    if (!user) return;
    
    setCreating(true);
    try {
      const newDocId = await createDocument(user.uid);
      // Force redirect to the newly created document
      router.push(`/document/${newDocId}`);
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Failed to create document.");
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this spreadsheet? This action cannot be undone.")) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete spreadsheet.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
          <span className="text-xl font-bold text-gray-800">CollabSheet</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Welcome, {user?.displayName || "User"}
          </span>
          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt="User profile" 
              className="w-10 h-10 rounded-full border border-gray-200"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recent Spreadsheets</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Create Document Button Card */}
          <button
            onClick={handleCreateDocument}
            disabled={creating}
            className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 h-40 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            ) : (
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            <span className="font-medium text-lg">
              {creating ? "Creating..." : "Blank spreadsheet"}
            </span>
          </button>

          {/* Render regular document cards */}
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={handleDeleteDocument} />
          ))}
        </div>

        {documents.length === 0 && !loading && (
          <div className="mt-12 text-center text-gray-500">
            <p className="text-lg">No spreadsheets yet.</p>
            <p className="text-sm mt-1">Create a blank spreadsheet to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
