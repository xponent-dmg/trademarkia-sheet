"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addPresence,
  removePresence,
  subscribeToPresence,
  updateHeartbeat,
  ActiveUser,
} from "@/lib/firestorePresence";

interface PresenceBarProps {
  documentId: string;
}

export default function PresenceBar({ documentId }: PresenceBarProps) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    if (!user || !documentId) return;

    // Add presence when component mounts
    addPresence(documentId, user.uid, user.displayName || "Anonymous");

    // Handle beforeunload to remove presence when closing tab
    const handleBeforeUnload = () => {
      removePresence(documentId, user.uid);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Heartbeat every 10 seconds
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat(documentId, user.uid);
    }, 10000);

    // Subscribe to presence updates
    const unsubscribe = subscribeToPresence(documentId, (users) => {
      setActiveUsers(users);
    });

    // Cleanup when component unmounts
    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribe();
      removePresence(documentId, user.uid);
    };
  }, [documentId, user]);

  return (
    <div className="flex items-center gap-4 text-sm mb-4">
      <span className="font-semibold text-gray-700">Active users:</span>
      {activeUsers.map((activeUser) => (
        <div key={activeUser.userId} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeUser.color }}
          ></div>
          <span className="text-gray-600 font-medium">{activeUser.name}</span>
        </div>
      ))}
    </div>
  );
}
