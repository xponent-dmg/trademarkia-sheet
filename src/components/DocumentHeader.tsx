"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateDocumentTitle } from "@/lib/firestore";
import ActiveUsersDropdown from "./ActiveUsersDropdown";

interface DocumentHeaderProps {
  documentId: string;
}

export default function DocumentHeader({ documentId }: DocumentHeaderProps) {
  const [title, setTitle] = useState("Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen to document changes
    const docRef = doc(db, "documents", documentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || "Untitled Spreadsheet");
      } else {
        setTitle("Spreadsheet Not Found");
      }
    });

    return () => unsubscribe();
  }, [documentId]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      // Optimistic update
      setTitle(trimmed);
      try {
        await updateDocumentTitle(documentId, trimmed);
      } catch (error) {
        // Revert on error (optional, mostly handled by the next snapshot)
        console.error("Failed to update title", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0 relative z-50">
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
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-xl font-semibold text-gray-800 tracking-tight border-b-2 border-blue-500 outline-none bg-transparent px-1 min-w-[200px]"
            />
          ) : (
            <h1 
              onClick={handleEditClick}
              className="text-xl font-semibold text-gray-800 tracking-tight cursor-text hover:bg-gray-50 px-1 rounded transition-colors border border-transparent hover:border-gray-200 inline-block"
              title="Click to rename"
            >
              {title}
            </h1>
          )}
          <span className="text-xs text-gray-500 font-mono px-1">
            ID: {documentId}
          </span>
        </div>
      </div>
      
      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Copy Link button */}
        <button
          onClick={handleCopyLink}
          title="Copy link to this document"
          className={`flex items-center justify-center p-2 rounded-full border transition-all duration-200 ${
            copied
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
          }`}
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </button>

        <ActiveUsersDropdown documentId={documentId} />
      </div>
    </div>
  );
}
