"use client"

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
  const { openMobile, setOpenMobile, isMobile } = useSidebar()

  const locale = params.lang as LocaleType

  const { settings } = useSettings()
  const direction = i18n.localeDirection[locale]
  const isRTL = (direction as string) === "rtl"
  const isHoizontalAndDesktop = settings.layout === "horizontal" && !isMobile

  // If the layout is horizontal and not on mobile, don't render the sidebar. (We use a menubar for horizontal layout navigation.)
  if (isHoizontalAndDesktop) return null

  const isSectionActive = (title: string) => {
    const section = title.toLowerCase()
    const path = pathname.toLowerCase()

    if (path.includes("/dashboards") && section === "dashboards") return true
    if (path.includes("/pages") && section === "pages") return true
    if (path.includes("/apps") && section === "apps") return true
    if (
      (path.includes("/ui") ||
        path.includes("/colors") ||
        path.includes("/typography") ||
        path.includes("/extended-ui") ||
        path.includes("/forms") ||
        path.includes("/tables") ||
        path.includes("/charts") ||
        path.includes("/icons") ||
        path.includes("/cards")) &&
      (section === "ui system" || section === "design system")
    )
      return true
    if (path.includes("/auth") && section === "security") return true

    return false
  }

  const renderMenuItem = (item: NavigationRootItem | NavigationNestedItem) => {
    const title = getDictionaryValue(
      titleCaseToCamelCase(item.title),
      dictionary.navigation
    )
    const label = item.label
      ? getDictionaryValue(titleCaseToCamelCase(item.label), dictionary.label)
      : undefined

    const isActive = "href" in item ? pathname === item.href : false

    // If the item has nested items, render it with a collapsible dropdown.
    if (item.items) {
      const isChildActive = item.items.some((child) =>
        "href" in child && child.href && pathname.includes(child.href)
      )

      return (
        <Collapsible className="group/collapsible" defaultOpen={isChildActive}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className={cn(
              "w-full justify-between transition-all duration-300 rounded-xl",
              isActive ? "bg-primary/5 text-primary" : "hover:bg-muted/50"
            )}>
              <span className="flex items-center">
                {"iconName" in item && (
                  <DynamicIcon name={(item as any).iconName} className={cn("me-2 h-4 w-4 transition-transform duration-300", isActive && "scale-110")} />
                )}
                <span className={cn("font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>{title}</span>
                {"label" in item && (
                  <Badge variant="secondary" className="me-2 text-[10px] h-4">
                    {label}
                  </Badge>
                )}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <SidebarMenuSub className="border-l border-primary/10 ml-4 pl-2 space-y-1 mt-1">
              {item.items.map((subItem) => {
                const isSubActive = pathname === subItem.href
                return (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-8 rounded-lg transition-all duration-200 px-3",
                        isSubActive
                          ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_rgba(var(--primary),0.2)]"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Link href={subItem.href || "#"} onClick={() => setOpenMobile(false)}>
                        {subItem.title}
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

    // Otherwise, render the item with a link.
    return (
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "transition-all duration-200 rounded-xl",
          isActive ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-muted/50"
        )}
      >
        <Link href={"href" in item ? item.href : "#"} onClick={() => setOpenMobile(false)}>
          {"iconName" in item && (
            <DynamicIcon name={(item as any).iconName} className="me-2 h-4 w-4" />
          )}
          <span>{title}</span>
          {"label" in item && (
            <Badge variant="secondary" className="me-2">
              {label}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarWrapper
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
      className="md:left-16 md:top-14 h-full md:h-[calc(100svh-3.51rem)] border-r border-sidebar-border bg-sidebar/80 backdrop-blur-md shadow-none"
    >
      <SidebarHeader className="p-4 flex flex-col gap-4">
        {/* Mobile-only section: Project Switcher and Section Switcher */}
        {isMobile && (
          <div className="flex flex-col gap-6 mb-2">
            <div className="flex items-center justify-between px-1">
              <ProjectSwitcher />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2">
                Main Sections
              </span>
              <div className="grid grid-cols-5 gap-2">
                {primaryNavItems.map((item) => {
                  const isActive = pathname.includes(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border",
                        isActive
                          ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="size-5 mb-1" />
                      <span className="text-[9px] font-medium truncate w-full text-center">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between md:mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2">Navigation Menu</span>
        </div>
      </SidebarHeader>
      <ScrollArea className="flex-1">
        <SidebarContent className="gap-0 px-2 pb-4">
          {navigationsData.map((nav) => {
            const isActive = isSectionActive(nav.title)
            const title = getDictionaryValue(
              titleCaseToCamelCase(nav.title),
              dictionary.navigation
            )

            return (
              <SidebarGroup key={nav.title} className={cn("p-0 mt-4 transition-opacity", !isActive && isMobile && "opacity-80")}>
                <SidebarGroupLabel className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-4 mb-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )}>
                  {title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {nav.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        {renderMenuItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })}
        </SidebarContent>
      </ScrollArea>
    </SidebarWrapper>
  )
}
