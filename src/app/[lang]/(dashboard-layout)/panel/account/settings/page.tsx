"use client"

import { useAuthStore } from "@/stores/auth-store"
import { DangerousZone } from "./_components/general/dangerous-zone"
import { ProfileInfo } from "./_components/general/profile-info"

export default function ProfileInfoPage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <div className="grid gap-4">
      <ProfileInfo user={user as any} />
      <DangerousZone user={user as any} />
    </div>
  )
}
