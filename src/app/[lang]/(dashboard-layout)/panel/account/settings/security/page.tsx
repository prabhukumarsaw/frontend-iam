"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { apiRequest } from "@/lib/api/client"
import { AccountRecoveryOptions } from "./_components/account-recovery-options"
import { ChangePassword } from "./_components/change-password"
import { RecentLogs } from "./_components/recent-logs"
import { SecurityPreferences } from "./_components/security-preferences"

export default function SecurityPage() {
  const user = useAuthStore((state: any) => state.user)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await apiRequest("/auth/sessions")
        setSessions(response.data || [])
      } catch (error) {
        console.error("Failed to fetch sessions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  if (!user) {
    return null
  }

  return (
    <div className="grid gap-4">
      <ChangePassword />
      <SecurityPreferences user={user as any} />
      <AccountRecoveryOptions user={user as any} />
      <RecentLogs sessions={sessions} isLoading={loading} />
    </div>
  )
}
