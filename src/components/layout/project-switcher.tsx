"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2, Check, Search } from "lucide-react"

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
import { useAuthStore } from "@/stores/auth-store"
import { apiRequest } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export function ProjectSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  const { tenantSlug, setAuthPayload, user, accessToken, refreshToken } = useAuthStore()
  const [tenants, setTenants] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await apiRequest("/tenants")
        setTenants(res.data.tenants || [])
      } catch (error) {
        console.error("Failed to fetch tenants", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTenants()
  }, [])

  const activeTenant = tenants.find((t) => t.slug === tenantSlug) || tenants[0]
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSwitchTenant = (tenant: any) => {
    if (tenant.slug === tenantSlug) return

    if (user && accessToken && refreshToken) {
      setAuthPayload({
        user: { ...user, tenantId: tenant.id, tenant: tenant },
        accessToken,
        refreshToken,
        expiresIn: 0,
        sessionId: ""
      }, tenant.slug)

      router.push(`/${lang}/dashboards/analytics`)
      router.refresh()
    }
  }

  if (loading && !activeTenant) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="animate-pulse opacity-50">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 px-2 hover:bg-muted/60 transition-all duration-300 rounded-xl data-[state=open]:bg-muted/80 data-[state=open]:scale-[0.98] ring-offset-background"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <Building2 className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-bold tracking-tight text-foreground">
                  {activeTenant?.name || "Select Workspace"}
                </span>
                <span className="truncate text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {activeTenant?.slug || "Workspace"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-40 transition-opacity group-hover:opacity-100" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl p-2 shadow-2xl border-sidebar-border/50 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <div className="px-2 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg text-sm"
                />
              </div>
            </div>
            <DropdownMenuSeparator className="bg-muted/50 mx-2" />
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
              {filteredTenants.map((tenant, index) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => handleSwitchTenant(tenant)}
                  className={cn(
                    "gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group mb-1 last:mb-0",
                    tenant.slug === tenantSlug
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-primary/5 focus:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-lg border transition-all duration-300",
                    tenant.slug === tenantSlug
                      ? "bg-primary/20 border-primary/30 shadow-inner"
                      : "bg-muted/30 border-transparent group-hover:border-primary/20"
                  )}>
                    <Building2 className={cn("size-4 shrink-0", tenant.slug === tenantSlug ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate">{tenant.name}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-tighter">{tenant.slug}</span>
                  </div>
                  {tenant.slug === tenantSlug ? (
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm animate-in zoom-in duration-300">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  ) : (
                    index < 9 && (
                      <DropdownMenuShortcut className="ml-auto opacity-30 group-hover:opacity-100 text-[10px]">⌘{index + 1}</DropdownMenuShortcut>
                    )
                  )}
                </DropdownMenuItem>
              ))}
              {filteredTenants.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground italic">
                  No workspaces found
                </div>
              )}
            </div>
            <DropdownMenuSeparator className="bg-muted/50 mx-2" />
            <DropdownMenuItem
              className="gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all group mt-1"
              onClick={() => router.push(`/${lang}/pages/account/settings/tenant-management`)}
            >
              <div className="flex size-9 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Plus className="size-4 text-primary" />
              </div>
              <div className="font-bold text-sm">Manage Workspaces</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
