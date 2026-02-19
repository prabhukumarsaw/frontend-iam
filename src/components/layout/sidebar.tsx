"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type {
  LocaleType,
  NavigationNestedItem,
  NavigationRootItem,
} from "@/types"

import { navigationsData } from "@/data/navigations"

import { i18n } from "@/configs/i18n"
import { ensureLocalizedPathname } from "@/lib/i18n"
import {
  cn,
  getDictionaryValue,
  isActivePathname,
  titleCaseToCamelCase,
} from "@/lib/utils"

import { useSettings } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  Sidebar as SidebarWrapper,
  useSidebar,
} from "@/components/ui/sidebar"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./command-menu"
import { ProjectSwitcher } from "./project-switcher"
import { UserDropdown } from "./user-dropdown"
// import { teams } from "@/configs/teams"
import { primaryNavItems } from "./sidebar-primary"

export function Sidebar({ dictionary }: { dictionary: DictionaryType }) {
  const pathname = usePathname()
  const params = useParams()
  const { setOpenMobile, isMobile } = useSidebar()
  const locale = params.lang as LocaleType
  const { settings } = useSettings()

  const isRTL = (i18n.localeDirection[locale as keyof typeof i18n.localeDirection] as string) === "rtl"
  const isHoizontalAndDesktop = settings.layout === "horizontal" && !isMobile


  if (isHoizontalAndDesktop) return null

  // Optimized Active Section Detection
  const activePrimarySection = React.useMemo(() => {
    return navigationsData.find(nav => {
      const section = nav.title.toLowerCase()
      const path = pathname.toLowerCase()
      
      const hasPathmatch = (items: (NavigationRootItem | NavigationNestedItem)[]): boolean => {
        return items.some(item => {
          if ("href" in item && item.href && pathname.startsWith(item.href)) return true
          if (item.items) return hasPathmatch(item.items)
          return false
        })
      }

      // Explicit section matches
      if (path.includes("/dashboards") && section === "dashboards") return true
      if (path.includes("/pages") && section === "pages") return true
      if (path.includes("/apps") && section === "apps") return true
      if (
        (path.includes("/ui") || path.includes("/colors") || path.includes("/typography") ||
         path.includes("/extended-ui") || path.includes("/forms") || path.includes("/tables") ||
         path.includes("/charts") || path.includes("/icons") || path.includes("/cards")) &&
        (section === "ui system" || section === "design system")
      ) return true
      if (path.includes("/auth") && section === "security") return true

      return hasPathmatch(nav.items)
    })
  }, [pathname])

  const renderMenuItem = React.useCallback((item: NavigationRootItem | NavigationNestedItem) => {
    const title = getDictionaryValue(titleCaseToCamelCase(item.title), dictionary.navigation)
    const label = item.label ? getDictionaryValue(titleCaseToCamelCase(item.label), dictionary.label) : undefined
    const isActive = "href" in item ? pathname === item.href : false

    if (item.items) {
      const isChildActive = item.items.some((child) => "href" in child && child.href && pathname.includes(child.href))

      return (
        <Collapsible className="group/collapsible w-full" defaultOpen={isChildActive}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton 
              className={cn(
                "w-full justify-between transition-all duration-300 rounded-xl px-3.5 py-2.5",
                isChildActive ? "bg-primary/[0.03] text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                {"iconName" in item && (
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isChildActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}>
                    <DynamicIcon name={(item as any).iconName} className="h-4 w-4" />
                  </div>
                )}
                <span className={cn(
                  "text-[13.5px] font-semibold tracking-tight transition-colors",
                  isChildActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {title}
                </span>
              </div>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-300 opacity-40 group-data-[state=open]/collapsible:rotate-180",
                isChildActive && "opacity-100 text-primary"
              )} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <SidebarMenuSub className="border-l border-primary/10 ml-[23px] pl-4 space-y-1 mt-1">
              {item.items.map((subItem) => {
                const isSubActive = pathname === subItem.href
                return (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-9 rounded-lg transition-all duration-200 px-3",
                        isSubActive
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-muted-foreground/70 hover:bg-primary/5 hover:text-foreground"
                      )}
                    >
                      <Link href={subItem.href || "#"} onClick={() => setOpenMobile(false)}>
                        <div className="flex items-center justify-between w-full">
                           <span className="text-[13px]">{subItem.title}</span>
                           {isSubActive && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "h-11 transition-all duration-300 rounded-xl px-3.5",
          isActive 
            ? "bg-primary/10 text-primary font-bold shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]" 
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <Link href={"href" in item ? item.href : "#"} onClick={() => setOpenMobile(false)}>
          <div className="flex items-center gap-3 w-full">
            {"iconName" in item && (
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <DynamicIcon name={(item as any).iconName} className="h-4 w-4" />
              </div>
            )}
            <span className="text-[13.5px] font-semibold tracking-tight">{title}</span>
            {"label" in item && (
              <Badge variant="secondary" className="ms-auto text-[9px] px-1.5 h-4 font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                {label}
              </Badge>
            )}
          </div>
        </Link>
      </SidebarMenuButton>
    )
  }, [pathname, dictionary, setOpenMobile])

  return (
    <SidebarWrapper
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
      className="md:left-16 md:top-14 h-full md:h-[calc(100svh-3.5rem)] border-r border-sidebar-border bg-sidebar/40 backdrop-blur-2xl transition-all duration-300"
    >
      <SidebarHeader className="px-6 pt-8 pb-4 flex flex-col gap-6">
        {/* Mobile View Enhancements */}
        {isMobile && (
           <div className="flex flex-col gap-8 mb-4">
              <ProjectSwitcher />
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 px-1">
                  Workspace Sections
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {primaryNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"))
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-500 border aspect-square",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30 scale-105"
                            : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        <item.icon className="size-6 mb-1.5" />
                        <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tighter">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
          </div>
        )}

        {/* Section Title with subtle glow */}
        <div className="flex items-center justify-between group">
           <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/80 group-hover:text-primary transition-colors">
                {activePrimarySection ? activePrimarySection.title : "Navigation"}
              </span>
           </div>
        </div>
      </SidebarHeader>

      <ScrollArea className="flex-1 px-3">
        <SidebarContent className="gap-2.5 py-4 no-scrollbar">
          {activePrimarySection ? (
            <SidebarMenu className="gap-2">
              {activePrimarySection.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {renderMenuItem(item)}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-center px-8 opacity-40 space-y-4">
               <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <DynamicIcon name="LayoutGrid" className="size-6" />
               </div>
               <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">
                  Select a module from the dashboard rail to get started.
               </p>
            </div>
          )}
        </SidebarContent>
      </ScrollArea>
      
      {/* Dynamic Footer Status */}
      <SidebarFooter className="p-5 mt-auto">
         <div className="rounded-[20px] bg-primary/[0.03] border border-primary/5 p-4 group cursor-default hover:bg-primary/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Core Engine</p>
               <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
               <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <DynamicIcon name="ShieldCheck" className="size-4" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground/80 leading-none">Security Active</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1">v1.28.4 build stable</span>
               </div>
            </div>
         </div>
      </SidebarFooter>
    </SidebarWrapper>
  )
}


