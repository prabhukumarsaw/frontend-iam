"use client"

import { ProfileContentIntroItem } from "./profile-content-info-intro-item"
import { useAuthStore } from "@/stores/auth-store"

export function ProfileContentIntroList() {
  const user = useAuthStore((state) => state.user)
  const role = (user as { role?: string } | null)?.role ?? "User"
  const organization =
    (user as { organization?: string } | null)?.organization ?? ""
  const state = (user as { state?: string } | null)?.state
  const country = (user as { country?: string } | null)?.country
  const email = user?.email ?? ""
  const phone = (user as { phoneNumber?: string } | null)?.phoneNumber ?? ""
  const language = (user as { language?: string } | null)?.language ?? ""

  const location =
    state && country ? `${state}, ${country}` : country ?? state ?? ""

  return (
    <ul className="grid gap-y-3">
      <ProfileContentIntroItem
        title="Works as a"
        value={
          <>
            {role}
            {organization && (
              <>
                <span className="text-foreground"> at </span> {organization}
              </>
            )}
          </>
        }
        iconName="BriefcaseBusiness"
      />
      <ProfileContentIntroItem
        title="Lives in"
        value={location}
        iconName="House"
      />

      <ProfileContentIntroItem
        title="Email"
        value={email}
        iconName="Mail"
      />

      <ProfileContentIntroItem
        title="Phone Number"
        value={phone}
        iconName="Phone"
      />
      <ProfileContentIntroItem
        title="Language"
        value={language}
        iconName="Languages"
      />
    </ul>
  )
}
