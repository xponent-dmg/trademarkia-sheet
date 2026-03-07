"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  createDocument,
  deleteDocument,
  DocumentData,
  fetchOpenedDocumentIds,
  fetchDocumentsByIds,
} from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import DocumentCard from "@/components/DocumentCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myDocuments, setMyDocuments] = useState<DocumentData[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/");
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // My Documents — real-time Firestore listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "documents"),
      where("createdBy", "==", user.uid)
    );

    const unsubscribeDocs = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as DocumentData;
        });

        // Sort: newest first
        docs.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis() || 0;
          const timeB = b.updatedAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setMyDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load documents:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeDocs();
  }, [user]);

  // Shared Documents — fetch once (not real-time, but refreshes when user changes)
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadSharedDocs = async () => {
      try {
        const openedIds = await fetchOpenedDocumentIds(user.uid);
        if (cancelled || openedIds.length === 0) return;

        const allOpenedDocs = await fetchDocumentsByIds(openedIds);

        if (cancelled) return;

        // Filter out documents the user owns
        const shared = allOpenedDocs.filter(
          (doc) => doc.createdBy !== user.uid
        );

        // Sort: newest first
        shared.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis() || 0;
          const timeB = b.updatedAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setSharedDocuments(shared);
      } catch (error) {
        console.error("Failed to load shared documents:", error);
      }
    };

    loadSharedDocs();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreateDocument = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const newDocId = await createDocument(user.uid);
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
    if (
      window.confirm(
        "Are you sure you want to delete this spreadsheet? This action cannot be undone."
      )
    ) {
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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-transparent backdrop-blur-xl border-b border-white/30 px-10 py-7 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-white rounded-2xl flex items-center justify-center shadow-lg rotate-3 shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 tracking-tight">CollabSheet</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-700">
            Welcome, {user?.displayName || "User"}
          </span>
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="User profile"
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* ── My Documents ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Documents</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Create Document Button */}
            <button
              onClick={handleCreateDocument}
              disabled={creating}
              className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 h-40 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <svg
                  className="w-12 h-12 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
              <span className="font-medium text-lg">
                {creating ? "Creating..." : "Blank spreadsheet"}
              </span>
            </button>

            {myDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>

          {myDocuments.length === 0 && (
            <p className="mt-6 text-sm text-gray-400">
              No spreadsheets yet. Create one above to get started.
            </p>
          )}
        </section>

        {/* ── Shared Documents ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Shared Documents
            </h2>
          </div>

          {sharedDocuments.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-8 text-gray-400">
              <svg
                className="w-6 h-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">
                No shared documents yet. Open a document shared with you and it
                will appear here.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sharedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
