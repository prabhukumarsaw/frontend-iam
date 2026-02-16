"use client"

import { useParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageDropdown } from "@/components/language-dropdown"
import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar"
import Image from "next/image"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Plus,
  BarChart3,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Keyboard } from "@/components/ui/keyboard"
import { ProjectSwitcher } from "../project-switcher"
import { CommandMenu } from "../command-menu"
import { teams } from "@/configs/teams"

export function VerticalLayoutHeader({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()

  const locale = params.lang as LocaleType

  return (
    <div className="flex flex-col w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-sidebar-border">
      <header className="flex h-14 items-center gap-4 px-6">
        <div className="flex items-center gap-4">
          <ToggleMobileSidebar />
          <Link href="/" className="md:hidden flex items-center justify-center">
            <Image
              src="/images/icons/shadboard.svg"
              alt="Logo"
              height={28}
              width={28}
              className="dark:invert"
            />
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <ProjectSwitcher teams={teams} />
            <SidebarTrigger className="h-8 w-8 hover:bg-muted transition-colors rounded-lg" />
          </div>
          <div className="h-4 w-px bg-sidebar-border mx-1 hidden md:block" />
          <Breadcrumb className="hidden lg:flex">
            <BreadcrumbList className="gap-1 sm:gap-2">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Updates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
          <CommandMenu dictionary={dictionary} buttonClassName="w-full h-9 border-none bg-muted/40 hover:bg-muted/60 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 hover:bg-muted/60 text-muted-foreground hover:text-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Reports</span>
            </Button>
            <Button size="sm" className="gap-2 h-9 px-4 shadow-md shadow-primary/10">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add</span>
            </Button>
          </div>
          <div className="h-8 w-px bg-sidebar-border mx-1 hidden sm:block" />
          <NotificationDropdown dictionary={dictionary} />
          <FullscreenToggle />
          <ModeDropdown dictionary={dictionary} />
          <LanguageDropdown dictionary={dictionary} />
        </div>
      </header>
    </div>
  )
}
