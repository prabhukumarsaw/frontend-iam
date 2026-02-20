"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

import type { LocaleType } from "@/types"

import { linksData } from "../../_data/nav-list-links"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

export function NavList() {
  const params = useParams()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const locale = params.lang as LocaleType

  const isAdmin = user?.userRoles?.some((ur: any) =>
    ["super-admin", "admin"].includes(ur.role.code)
  )

  const filteredLinks = linksData.filter(
    (link) => !link.superAdminOnly || isAdmin
  )

  return (
    <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground md:flex-col">
      {filteredLinks.map((link) => {
        const localizedPathname = ensureLocalizedPathname(link.href, locale)

        return (
          <Link
            key={link.title}
            href={localizedPathname}
            className={cn(
              pathname === localizedPathname && "font-semibold text-primary" // Highlight the current page
            )}
            aria-current={pathname === localizedPathname ? "page" : undefined}
          >
            {link.title}
          </Link>
        )
      })}
    </nav>
  )
}
