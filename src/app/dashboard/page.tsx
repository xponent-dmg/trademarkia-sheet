"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/context/AuthContext';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-800 font-sans selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-black-600 rounded-lg flex items-center justify-center shadow-md rotate-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
            CollabSheet
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-500">Connected</span>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user.displayName}</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
                {user.photoURL ? (
                  <Image src={"logo.png"} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                ) : (
                  user.displayName?.charAt(0) || 'U'
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toolbar Placeholder */}
        <div className="mb-4 flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200/60">
          <div className="flex space-x-1 border-r border-gray-200 pr-2">
            {[1, 2, 3].map(i => (
              <button key={i} className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
              </button>
            ))}
          </div>
          <div className="flex space-x-1 pl-2">
            {[1, 2, 3, 4].map(i => (
              <button key={i} className="px-3 h-8 text-xs font-medium text-gray-600 rounded hover:bg-gray-100 transition-colors">
                Action {i}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Area Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden relative">
          {/* Mock row and column headers */}
          <div className="absolute top-0 left-10 right-0 h-8 border-b border-gray-200 bg-gray-50 flex">
             {['A', 'B', 'C', 'D', 'E', 'F'].map(col => (
               <div key={col} className="w-48 h-full border-r border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                 {col}
               </div>
             ))}
          </div>
          <div className="absolute top-8 left-0 bottom-0 w-10 border-r border-gray-200 bg-gray-50 flex flex-col">
             {[1, 2, 3, 4, 5, 6, 7].map(row => (
               <div key={row} className="h-12 w-full border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                 {row}
               </div>
             ))}
          </div>
          
          {/* Main Grid Area */}
          <div className="min-h-[500px] lg:min-h-[700px] ml-10 mt-8 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pb-20 pointer-events-none">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Spreadsheet Ready</h2>
              <p className="text-gray-500 max-w-sm">
                The core layout is established. You can now build out the React data grid here.
              </p>
            </div>
            
            {/* Grid Lines Mockup */}
            <div className="absolute inset-0 border-t border-l border-gray-100 opacity-50" 
                 style={{ backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)', backgroundSize: '12rem 3rem' }}>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
