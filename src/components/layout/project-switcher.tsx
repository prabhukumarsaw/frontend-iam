"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function ProjectSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 px-2 hover:bg-muted/60 transition-colors rounded-xl data-[state=open]:bg-muted/80"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                <activeTeam.logo className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-bold tracking-tight text-foreground">
                  {activeTeam.name}
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground uppercase opacity-70">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50 transition-opacity hover:opacity-100" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-2 shadow-2xl border-sidebar-border"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={10}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Select Workspace
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-3 p-2 rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary transition-all group"
              >
                <div className="flex size-8 items-center justify-center rounded-lg border bg-muted/40 group-focus:border-primary/30 transition-colors">
                  <team.logo className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{team.name}</span>
                  <span className="text-[10px] text-muted-foreground">{team.plan}</span>
                </div>
                <DropdownMenuShortcut className="ml-auto opacity-30 group-focus:opacity-100">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/60">
              <div className="flex size-8 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-background">
                <Plus className="size-4 text-muted-foreground" />
              </div>
              <div className="font-semibold text-sm text-muted-foreground">Add new Team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
