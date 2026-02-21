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

import { useMenus } from "@/hooks/use-menus"

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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Sidebar as SidebarWrapper,
  useSidebar,
} from "@/components/ui/sidebar"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./command-menu"
import { ProjectSwitcher } from "./project-switcher"
import { UserDropdown } from "./user-dropdown"

export function Sidebar({ dictionary }: { dictionary: DictionaryType }) {
  const pathname = usePathname()
  const params = useParams()
  const { setOpenMobile, isMobile } = useSidebar()
  const locale = params.lang as LocaleType
  const { settings } = useSettings()

  const { navigationData, loading } = useMenus()

  const isRTL = (i18n.localeDirection[locale as keyof typeof i18n.localeDirection] as string) === "rtl"
  const isHoizontalAndDesktop = settings.layout === "horizontal" && !isMobile


  if (isHoizontalAndDesktop) return null

  // Helper to check if a navigation item or any of its children matches the current path
  const isItemActive = React.useCallback(
    (item: any): boolean => {
      // 1. Direct match (loose to allow sub-pages)
      if (item.href && isActivePathname(item.href, pathname)) return true

      // 2. Fragment match (e.g., /en/dashboards matches Dashboards section)
      const segments = pathname.split("/").filter(Boolean)
      const titleLower = item.title?.toLowerCase()

      // Match segments (e.g., index 1 for /en/dashboards)
      if (segments.length > 1 && titleLower && segments[1] === titleLower) return true
      if (segments.length > 2 && titleLower && segments[2] === titleLower) return true

      // 3. Recursive child match
      if (item.items && item.items.length > 0) {
        return item.items.some((subItem: any) => isItemActive(subItem))
      }
      return false
    },
    [pathname]
  )


  // Fully Dynamic Active Section Detection
  const activePrimarySection = React.useMemo(() => {
    if (!navigationData || navigationData.length === 0) return null
    return navigationData.find((nav) => isItemActive(nav))
  }, [navigationData, isItemActive])

  const renderMenuItem = React.useCallback(
    (item: any, depth: number = 0) => {
      const titleKey = titleCaseToCamelCase(item.title)
      const title = dictionary.navigation[titleKey as keyof typeof dictionary.navigation] || item.title
      const labelKey = item.label ? titleCaseToCamelCase(item.label) : null
      const label = labelKey ? (dictionary.label as any)[labelKey] : undefined

      const isActive = item.href ? isActivePathname(item.href, pathname, true) : false
      const sectionActive = isItemActive(item)
      const isSubItem = depth > 0

      // Common content for both MenuButton and SubButton
      const itemContent = (
        <div className="flex items-center gap-3 w-full">
          {item.iconName && depth === 0 && (
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              (isActive || sectionActive) ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
            )}>
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            </div>
          )}
          <span className={cn(
            "text-[13.5px] font-semibold tracking-tight transition-colors",
            (isActive || sectionActive) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {title}
          </span>
          {label && (
            <Badge variant="secondary" className="ms-auto text-[9px] px-1.5 h-4 font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
              {label}
            </Badge>
          )}
        </div>
      )

      if (item.items && item.items.length > 0) {
        const MenuButtonComp: any = isSubItem ? SidebarMenuSubButton : SidebarMenuButton
        const MenuItemComp = isSubItem ? SidebarMenuSubItem : SidebarMenuItem

        return (
          <MenuItemComp key={item.title}>
            <Collapsible
              className="group/collapsible w-full"
              defaultOpen={sectionActive}
            >
              <CollapsibleTrigger asChild>
                <MenuButtonComp
                  className={cn(
                    "w-full justify-between transition-all duration-300 rounded-xl px-3.5 py-2.5 h-auto",
                    sectionActive ? "bg-primary/[0.03] text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {itemContent}
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-300 opacity-40 group-data-[state=open]/collapsible:rotate-180",
                    sectionActive && "opacity-100 text-primary"
                  )} />
                </MenuButtonComp>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarMenuSub className={cn(
                  "border-l border-primary/10 space-y-1 mt-1 px-0",
                  depth === 0 ? "ml-[23px] pl-4" : "ml-4 pl-2"
                )}>
                  {item.items.map((subItem: any) => renderMenuItem(subItem, depth + 1))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </MenuItemComp>
        )
      }

      const MenuButtonComp: any = isSubItem ? SidebarMenuSubButton : SidebarMenuButton
      const MenuItemComp = isSubItem ? SidebarMenuSubItem : SidebarMenuItem

      return (
        <MenuItemComp key={item.title}>
          <MenuButtonComp
            asChild
            isActive={isActive}
            className={cn(
              "h-11 transition-all duration-300 rounded-xl px-3.5",
              isActive
                ? "bg-primary/10 text-primary font-bold shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={item.href || "#"} onClick={() => setOpenMobile(false)}>
              {itemContent}
            </Link>
          </MenuButtonComp>
        </MenuItemComp>
      )
    },
    [pathname, dictionary, setOpenMobile, isItemActive]
  )

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
                {navigationData.map((item) => {
                  const isActive = isItemActive(item)
                  return (
                    <Link
                      key={item.title}
                      href={item.href || "#"}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-500 border aspect-square",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30 scale-105"
                          : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      <DynamicIcon name={item.iconName || "LayoutGrid"} className="size-6 mb-1.5" />
                      <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tighter">{item.title}</span>
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
              {activePrimarySection.items.map((item: any) => renderMenuItem(item))}
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


