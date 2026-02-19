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
    <div className="flex flex-col items-center w-16 h-svh bg-sidebar/95 backdrop-blur-3xl border-r border-sidebar-border z-50 fixed left-0 top-0 py-6 shadow-[1px_0_0_0_rgba(0,0,0,0.1),8px_0_24px_-8px_rgba(0,0,0,0.05)]">
      {/* Logo Section - Brand Identity */}
      <div className="mb-8 relative group">
        <Link 
          href="/" 
          className="h-11 w-11 flex items-center justify-center rounded-[14px] bg-primary shadow-[0_8px_16px_-6px_rgba(var(--primary),0.4)] hover:shadow-[0_12px_20px_-8px_rgba(var(--primary),0.5)] active:scale-95 transition-all duration-500 ease-out"
        >
          <Image
            src="/images/icons/shadboard.svg"
            alt="Logo"
            height={26}
            width={26}
            className="invert opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </Link>
        {/* Subtle separator glow */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-gradient-to-r from-transparent via-sidebar-border to-transparent blur-[0.5px]" />
      </div>

      {/* Nav Items - Premium Workspace Switcher Style */}
      <div className="flex-1 flex flex-col items-center gap-2.5 w-full px-2.5 overflow-y-auto no-scrollbar py-2">
        {primaryNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"))
          
          return (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="relative flex items-center justify-center w-full group py-0.5">
                  {/* Premium Indicator Pill - Discord inspired smoothing */}
                  <div 
                    className={cn(
                      "absolute -left-2.5 w-1.5 rounded-r-full bg-primary transition-all duration-300 ease-in-out shadow-[2px_0_8px_rgba(var(--primary),0.4)]",
                      isActive ? "h-8 opacity-100" : "h-2 opacity-0 group-hover:opacity-60 group-hover:h-5"
                    )} 
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-11 transition-all duration-500 rounded-[22px] hover:rounded-[15px] relative group-active:scale-90",
                      isActive 
                        ? "rounded-[14px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                        : "text-muted-foreground/80 hover:bg-primary/10 hover:text-primary"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("size-[22px] transition-all duration-300", isActive ? "scale-105" : "group-hover:scale-110")} />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={16} className="bg-foreground text-background font-bold text-[11px] uppercase tracking-[0.1em] px-3 py-2 rounded-lg border-none shadow-xl">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Profile/Bottom Actions */}
      <div className="mt-auto flex flex-col items-center gap-5 pt-4 border-t border-sidebar-border/30 w-full px-2">
        <div className="relative group cursor-pointer active:scale-95 transition-transform duration-300">
          <UserDropdown dictionary={dictionary} locale={locale} />
          {/* Online Indicator */}
          <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-sidebar-background rounded-full shadow-sm shadow-emerald-500/20" />
        </div>
      </div>
    </div>
  )
}


