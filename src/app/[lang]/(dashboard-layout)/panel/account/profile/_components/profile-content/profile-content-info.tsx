import { ProfileContentConnection } from "./profile-content-info-connection"
import { ProfileContentIntro } from "./profile-content-info-intro"

export function ProfileContentInfo() {
  return (
    <div className="flex-1 space-y-6 md:flex-none md:w-2/5 lg:w-1/3">
      <ProfileContentIntro />
      <ProfileContentConnection />
    </div>
  )
}
