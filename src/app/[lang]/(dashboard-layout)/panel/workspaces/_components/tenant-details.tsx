"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api/client"
import {
    Globe,
    Hash,
    Info,
    Layers,
    Calendar,
    Settings,
    ShieldCheck,
    Cpu,
    Activity,
    Server,
    Clock,
    Box
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TenantDetailsProps {
    tenantId: string
}

export function TenantDetails({ tenantId }: TenantDetailsProps) {
    const [tenant, setTenant] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDetails() {
            try {
                setLoading(true)
                const res = await apiRequest(`/tenants/${tenantId}`)
                setTenant(res.data.tenant)
            } catch (error) {
                console.error("Failed to fetch tenant details", error)
            } finally {
                setLoading(false)
            }
        }

        if (tenantId) {
            fetchDetails()
        }
    }, [tenantId])

    if (loading) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                </div>
                <div className="h-48 bg-muted rounded animate-pulse w-full" />
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <Box className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <h3 className="text-sm font-semibold">Tenant Not Found</h3>
                <p className="text-xs text-muted-foreground mt-1">Unable to load node configuration.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full w-full -mr-4 pr-4">
            <div className="space-y-6 w-full max-w-full overflow-hidden">
                {/* Clean Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 min-w-0">
                            <div className="h-12 w-12 rounded bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                                <Server className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight truncate">{tenant.name}</h2>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-full px-2 py-0 text-[10px] font-medium border-0 shrink-0",
                                            tenant.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                        )}
                                    >
                                        {tenant.isActive ? "Operational" : "Standby"}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-mono">
                                        <Hash className="h-3 w-3" />
                                        {tenant.id.split('-')[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Updated {format(new Date(tenant.updatedAt), "HH:mm")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full bg-muted/40 p-1 border h-10 flex overflow-x-auto no-scrollbar">
                        <TabsTrigger value="overview" className="flex-1 text-xs gap-2 min-w-fit">
                            <Cpu className="h-3.5 w-3.5" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="modules" className="flex-1 text-xs gap-2 min-w-fit">
                            <Layers className="h-3.5 w-3.5" /> Modules
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex-1 text-xs gap-2 min-w-fit">
                            <Settings className="h-3.5 w-3.5" /> Config
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 space-y-4 outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: Globe, label: "Endpoint", value: tenant.domain || "local.internal", color: "text-blue-500" },
                                { icon: Activity, label: "Internal Key", value: tenant.slug, color: "text-emerald-500" },
                                { icon: Calendar, label: "Created", value: format(new Date(tenant.createdAt), "MMM d, yyyy"), color: "text-slate-500" },
                                { icon: ShieldCheck, label: "Policy", value: "Standard Auth", color: "text-amber-500" }
                            ].map((item, i) => (
                                <div key={i} className="p-3 rounded-md border bg-card/50 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">{item.label}</span>
                                    </div>
                                    <p className="text-xs font-semibold truncate px-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <Card className="border border-border/50 shadow-none overflow-hidden">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase truncate">
                                    <Activity className="h-3.5 w-3.5" /> Environmental Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 space-y-3">
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <span className="text-xs font-medium truncate">Node Connectivity</span>
                                    <div className="flex gap-1 shrink-0">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500" />)}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <span className="text-xs font-medium truncate">Security Sync</span>
                                    <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 font-medium bg-primary/5 text-primary border-primary/20 shrink-0">Verified</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="modules" className="mt-4 space-y-2 outline-none">
                        {tenant.modules?.length > 0 ? (
                            <div className="grid gap-2">
                                {tenant.modules.map((tm: any) => (
                                    <div key={tm.id} className="flex items-center justify-between p-3 rounded-md border bg-card/50 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-xs font-semibold truncate">{tm.module.name}</p>
                                                <p className="text-[10px] text-muted-foreground italic truncate">{tm.module.description}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-2 w-2 rounded-full shrink-0",
                                            tm.isEnabled ? "bg-emerald-500" : "bg-muted"
                                        )} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 border rounded-md border-dashed bg-muted/20">
                                <Box className="h-6 w-6 text-muted-foreground/30 mb-2" />
                                <p className="text-xs font-semibold">No Modules Integrated</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="config" className="mt-4 space-y-3 outline-none">
                        <div className="rounded-md border bg-slate-950 p-4 font-mono text-[11px] overflow-hidden">
                            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                <span className="text-white/40 uppercase tracking-tighter text-[9px] font-bold">Node Config</span>
                                <div className="flex gap-1">
                                    <div className="h-2 w-2 rounded-full bg-white/10" />
                                    <div className="h-2 w-2 rounded-full bg-white/10" />
                                </div>
                            </div>
                            <pre className="text-emerald-400 overflow-x-auto selection:bg-white/10">
                                {JSON.stringify(tenant.settings || {}, null, 4)}
                            </pre>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border">
                            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Configuration parameters are encrypted at the edge. Advanced settings require administrative access keys for modification.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    )
}


