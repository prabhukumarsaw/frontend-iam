"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Palette,
  LayoutGrid,
  Bell,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UserDropdown } from "./user-dropdown"
import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import Image from "next/image"

export const primaryNavItems = [
  { icon: LayoutDashboard, label: "Dashboards", href: "/dashboards/analytics" },
  { icon: FileText, label: "Pages", href: "/pages/landing" },
  { icon: LayoutGrid, label: "Apps", href: "/apps/chat" },
  { icon: Palette, label: "UI System", href: "/typography" },
  { icon: ShieldCheck, label: "Security", href: "/auth/login" },
]

export function SidebarPrimary({
  dictionary,
  locale,
}: {
  dictionary: DictionaryType
  locale: LocaleType
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col items-center w-16 h-svh bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border z-30 fixed left-0 top-0 py-4 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)]">
      {/* Logo */}
      <Link href="/" className="mb-8 h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 hover:scale-105 shadow-sm border border-primary/20">
        <Image
          src="/images/icons/shadboard.svg"
          alt="Logo"
          height={28}
          width={28}
          className="dark:invert drop-shadow-sm"
        />
      </Link>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col items-center gap-4 w-full px-2">
        {primaryNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"))
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div className="relative group flex items-center justify-center w-full">
                  {/* Active Indicator - Premium Gradient Pill */}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-primary/40 via-primary to-primary/40 rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-10 rounded-xl transition-all duration-300 relative",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-[0_8px_16px_-4px_rgba(var(--primary),0.3)] scale-105" 
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-110"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("size-5 transition-transform duration-300", isActive && "scale-110")} />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p className="font-medium">{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Profile/Bottom Actions */}
      <div className="mt-auto flex flex-col items-center gap-4 pb-2">
        <div className="h-px w-8 bg-sidebar-border mb-2" />
        <UserDropdown dictionary={dictionary} locale={locale} />
      </div>
    </div>
  )
}
