"use client"

import { useEffect, useState } from "react"
import app from "../lib/firebase"

export default function Home() {
  const [status, setStatus] = useState("Checking Firebase...")

  useEffect(() => {
    try {
      if (app) {
        setStatus("Firebase initialized successfully ✅")
      } else {
        setStatus("Firebase failed to initialize ❌")
      }
    } catch (error) {
      console.error(error)
      setStatus("Firebase failed to initialize ❌")
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center p-10 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">
          Trademarkia Spreadsheet Setup
        </h1>

        <p className="text-lg">{status}</p>

        <p className="text-sm text-zinc-500 mt-4">
          If this shows success, Firebase is configured correctly.
        </p>
      </div>
    </div>
  )
}