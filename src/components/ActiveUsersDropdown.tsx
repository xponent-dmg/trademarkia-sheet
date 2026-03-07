"use client";

import { useState, useRef, useEffect } from "react";
import { ActiveUser, subscribeToPresence } from "@/lib/firestorePresence";

interface ActiveUsersDropdownProps {
  documentId: string;
}

export default function ActiveUsersDropdown({ documentId }: ActiveUsersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    if (!documentId) return;
    const unsubscribe = subscribeToPresence(documentId, (users) => {
      setActiveUsers(users);
    });
    return () => unsubscribe();
  }, [documentId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        Active users: {activeUsers.length} 
        <span className="text-xs ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] py-1">
          {activeUsers.length === 0 ? (
            <div className="px-4 py-3 justify-center text-sm text-gray-500 italic text-center">
              No active users
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {activeUsers.map((activeUser) => (
                <div key={activeUser.userId} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeUser.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 truncate" title={activeUser.name}>
                    {activeUser.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
