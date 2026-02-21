"use client"

import { useEffect, useState, useMemo } from "react"
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
    Box,
    ExternalLink,
    Database,
    Binary,
    Lock,
    Users,
    UserCircle
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
import { TenantUsers } from "./tenant-users"
import { Button } from "@/components/ui/button"

interface TenantDetailsProps {
    tenantId: string
    isPage?: boolean
}

export function TenantDetails({ tenantId, isPage = false }: TenantDetailsProps) {
    const [tenant, setTenant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

    const selectedModule = useMemo(() => {
        if (!tenant || !selectedModuleId) return null
        return tenant.modules.find((tm: any) => tm.moduleId === selectedModuleId)
    }, [tenant, selectedModuleId])

    useEffect(() => {
        if (tenant?.modules?.length > 0 && !selectedModuleId) {
            setSelectedModuleId(tenant.modules[0].moduleId)
        }
    }, [tenant])

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
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
                        <div className="h-3.5 w-1/4 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-muted rounded-xl animate-pulse w-full" />
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Box className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Tenant Not Found</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    We couldn't retrieve the configuration for this workspace. It may have been relocated or deleted.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start h-9 bg-transparent border-b rounded-none p-0 gap-4 mb-4">
                            <TabsTrigger
                                value="overview"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-2 h-9 text-xs font-bold transition-all uppercase tracking-tight"
                            >
                                <Cpu className="h-3.5 w-3.5 mr-2" /> Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="modules"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-2 h-9 text-xs font-bold transition-all uppercase tracking-tight"
                            >
                                <Layers className="h-3.5 w-3.5 mr-2" /> Modules
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-2 h-9 text-xs font-bold transition-all uppercase tracking-tight"
                            >
                                <Users className="h-3.5 w-3.5 mr-2" /> Users
                            </TabsTrigger>
                            <TabsTrigger
                                value="logs"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-2 h-9 text-xs font-bold transition-all uppercase tracking-tight"
                            >
                                <Activity className="h-3.5 w-3.5 mr-2" /> Activity
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-5 animate-in fade-in-50 duration-300 outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { icon: Globe, label: "Public Endpoint", value: tenant.domain || "local.internal", detail: "DNS Routing Active", color: "text-blue-500", bgColor: "bg-blue-500/5" },
                                    { icon: Binary, label: "Identifier Segment", value: tenant.slug, detail: "Unique namespace slug", color: "text-indigo-500", bgColor: "bg-indigo-500/5" },
                                    { icon: Calendar, label: "Deployment Date", value: format(new Date(tenant.createdAt), "MMMM d, yyyy"), detail: "Initial provision", color: "text-slate-500", bgColor: "bg-slate-500/5" },
                                    { icon: ShieldCheck, label: "Security Profile", value: "Enterprise Protocol", detail: "IAM v2.0 compliant", color: "text-emerald-500", bgColor: "bg-emerald-500/5" }
                                ].map((item, i) => (
                                    <div key={i} className="group flex flex-col p-4 rounded-xl border bg-card hover:bg-muted/5 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={cn("p-2 rounded-lg", item.bgColor)}>
                                                <item.icon className={cn("h-4 w-4", item.color)} />
                                            </div>
                                            <Badge variant="outline" className="text-[9px] border-none uppercase tracking-widest text-muted-foreground font-bold italic">Verified</Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{item.label}</span>
                                            <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                                            <p className="text-[10px] text-muted-foreground/70">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Card className="border-border shadow-none overflow-hidden bg-muted/5">
                                <CardHeader className="py-4 px-5 border-b bg-muted/10">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-tighter">
                                        <Database className="h-4 w-4" /> System Environment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">Node Connectivity</span>
                                            <span className="text-[10px] text-muted-foreground">Current health status of the workspace node</span>
                                        </div>
                                        <div className="flex gap-1.5 ring-1 ring-emerald-500/20 p-1.5 rounded-full bg-emerald-500/5">
                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
                                        </div>
                                    </div>
                                    <Separator className="opacity-50" />
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">Infrastructure Layer</span>
                                            <span className="text-[10px] text-muted-foreground">Virtual instance architecture</span>
                                        </div>
                                        <Badge variant="secondary" className="px-2 py-0 h-6 text-[10px] font-bold tracking-tight">Standard-D2s-v3</Badge>
                                    </div>
                                    <Separator className="opacity-50" />
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">Region</span>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <Globe className="h-3 w-3" /> US East (Northern Virginia)
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="modules" className="space-y-4 animate-in fade-in-50 duration-300 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[600px]">
                                {/* Module List Sidebar */}
                                <div className="md:col-span-2 flex flex-col gap-4 border-r pr-6 h-full overflow-y-auto pb-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-sm font-bold text-foreground">Active Modules</h3>
                                        <Badge variant="outline" className="text-[10px] rounded-lg tracking-wider bg-muted/50">{tenant.modules?.length || 0}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {tenant.modules?.length > 0 ? (
                                            tenant.modules.map((tm: any) => (
                                                <button
                                                    key={tm.id}
                                                    onClick={() => setSelectedModuleId(tm.moduleId)}
                                                    className={cn(
                                                        "w-full group flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                                        selectedModuleId === tm.moduleId
                                                            ? "bg-primary/[0.04] border-primary/20 shadow-sm"
                                                            : "bg-background hover:bg-muted/30 border-transparent hover:border-muted-foreground/10"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                                            selectedModuleId === tm.moduleId
                                                                ? "bg-primary/10 text-primary"
                                                                : "bg-muted text-muted-foreground group-hover:bg-primary/5"
                                                        )}>
                                                            <Layers className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <p className="text-xs font-bold text-foreground truncate">{tm.module.name}</p>
                                                            <p className="text-[10px] text-muted-foreground truncate">{tm.module.code}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full shrink-0",
                                                        tm.isEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-muted"
                                                    )} />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 opacity-50">
                                                <Box className="h-8 w-8 mb-2" />
                                                <p className="text-[10px]">No Modules</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Module Detail View */}
                                <div className="md:col-span-3 h-full flex flex-col animate-in slide-in-from-right-2 duration-300">
                                    {selectedModule ? (
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold tracking-tight">{selectedModule.module.name}</h3>
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic">{selectedModule.module.description}</p>
                                                </div>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                                                    {selectedModule.isEnabled ? "Active Node" : "Disabled"}
                                                </Badge>
                                            </div>

                                            <div className="flex-1 space-y-6">
                                                <div className="p-4 rounded-xl border bg-muted/10 border-dashed">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Module Stakeholders</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex -space-x-3 overflow-hidden p-1">
                                                            {[1, 2, 3, 4].map(i => (
                                                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                                                    U{i}
                                                                </div>
                                                            ))}
                                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                +12
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground mt-2">
                                                            Currently 16 users have permission to access the <strong>{selectedModule.module.name}</strong> services in this workspace.
                                                        </p>
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10 px-0">
                                                            Filter Global User List →
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Binary className="h-4 w-4 text-primary" />
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configuration Metadata</span>
                                                    </div>
                                                    <pre className="p-4 rounded-xl bg-card border font-mono text-[10px] text-muted-foreground overflow-x-auto">
                                                        {JSON.stringify(selectedModule.config || { status: "ready", autoUpdate: true, replication: "geo-local" }, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 border-t flex gap-3">
                                                <Button size="sm" className="flex-1 h-9 text-xs font-bold gap-2">
                                                    <Database className="h-3.5 w-3.5" /> Initialize Sync
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1 h-9 text-xs font-bold gap-2">
                                                    <Lock className="h-3.5 w-3.5" /> Manage Policies
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                            <Layers className="h-12 w-12 mb-4" />
                                            <p className="text-sm font-medium">Select a module to view occupants and logs</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4 animate-in fade-in-50 duration-300 outline-none mt-6">
                            <TenantUsers tenantId={tenantId} />
                        </TabsContent>

                        <TabsContent value="logs" className="space-y-4 animate-in fade-in-50 duration-300 outline-none">
                            <div className="space-y-4">
                                {[
                                    { action: "Settings Updated", user: "Internal System", time: "12 mins ago", icon: Settings },
                                    { action: "Module 'CRM' Enabled", user: "Admin User", time: "2 hours ago", icon: Layers },
                                    { action: "Node Healthy Heartbeat", user: "Worker-01", time: "5 hours ago", icon: Activity },
                                    { action: "Security Baseline Audit", user: "System Guard", time: "Yesterday", icon: Lock },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl items-start bg-card border last:border-b">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                            <log.icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-sm font-medium text-foreground">{log.action}</p>
                                                <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">Initiated by <span className="font-semibold">{log.user}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Info Area */}
                <div className="space-y-6">
                    <Card className="border-border shadow-none overflow-hidden">
                        <CardHeader className="py-4 px-5 border-b bg-muted/10">
                            <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-tighter">
                                <Settings className="h-4 w-4" /> Advanced Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="bg-slate-950 font-mono text-[11px] leading-relaxed p-5 min-h-[200px] max-h-[400px] overflow-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <span className="text-white/30 uppercase tracking-widest text-[9px] font-bold">RAW JSON SCHEMA</span>
                                    <div className="flex gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-red-500/40" />
                                        <div className="h-2 w-2 rounded-full bg-amber-500/40" />
                                        <div className="h-2 w-2 rounded-full bg-emerald-500/40" />
                                    </div>
                                </div>
                                <pre className="text-blue-300/90 whitespace-pre-wrap">
                                    {JSON.stringify(tenant.settings || { "env": "production", "region": "us-east-1", "scaling": "auto" }, null, 4)}
                                </pre>
                            </div>
                            <div className="p-4 bg-muted/20 border-t flex items-start gap-3">
                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Configuration parameters are stored in a secure HSM. Advanced changes require cluster-level permissions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-none bg-muted/10">
                        <CardContent className="p-5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-tight">Quick Actions</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted text-left transition-colors">
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                    <span className="text-xs text-foreground font-medium">Launch Dashboard</span>
                                </button>
                                <button className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted text-left transition-colors">
                                    <Database className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs text-foreground font-medium">Backup Data</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
