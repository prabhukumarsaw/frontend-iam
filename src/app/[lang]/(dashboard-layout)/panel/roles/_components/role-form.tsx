"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api/client"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    Layout,
    Info,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Plus,
    Search as SearchIcon,
    Terminal,
    Key,
    Activity,
    Package,
    Power
} from "lucide-react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const roleSchema = z.object({
    name: z.string().min(1, { message: "Role name is required" }),
    code: z.string().min(1, { message: "Role code is required" }).regex(/^[a-z0-9_:]+$/, { message: "Code must be lowercase alphanumeric with underscores/colons" }),
    description: z.string().optional(),
    permissionIds: z.array(z.string()).default([]),
    menuIds: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
})

interface RoleFormProps {
    onSuccess: () => void
    onCancel: () => void
    editData?: any
}

export function RoleForm({ onSuccess, onCancel, editData }: RoleFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fetchingDeps, setFetchingDeps] = useState(true)
    const [allPermissions, setAllPermissions] = useState<any[]>([])
    const [allMenus, setAllMenus] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("general")
    const [permSearch, setPermSearch] = useState("")

    const isEdit = !!editData

    const form = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: editData?.name || "",
            code: editData?.code || "",
            description: editData?.description || "",
            permissionIds: editData?.rolePermissions?.map((rp: any) => rp.permissionId) || [],
            menuIds: editData?.roleMenus?.map((rm: any) => rm.menuId) || [],
            isActive: editData ? editData.isActive : true,
        },
    })

    useEffect(() => {
        async function fetchData() {
            try {
                setFetchingDeps(true)
                const [permsRes, menusRes] = await Promise.all([
                    apiRequest("/permissions").catch(() => ({ data: { permissions: [] } })),
                    apiRequest("/menus").catch(() => ({ data: { menus: [] } }))
                ])
                setAllPermissions(permsRes.data?.permissions || [])
                setAllMenus(menusRes.data?.menus || [])
            } catch (error) {
                console.error("Failed to fetch role dependencies", error)
            } finally {
                setFetchingDeps(false)
            }
        }
        fetchData()
    }, [])

    async function onSubmit(values: z.infer<typeof roleSchema>) {
        try {
            setLoading(true)

            if (isEdit) {
                await apiRequest(`/roles/${editData.id}`, {
                    method: "PATCH",
                    body: values,
                })
                toast({ title: "Configuration Updated", description: "Successfully synced security parameters with the core registry." })
            } else {
                await apiRequest("/roles", {
                    method: "POST",
                    body: values,
                })
                toast({ title: "Role Provisioned", description: "New security archetype has been successfully deployed." })
            }
            onSuccess()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Provisioning Conflict",
                description: error.message || "The core engine rejected the configuration update.",
            })
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: "general", label: "Registry Header", icon: Info },
        { id: "permissions", label: "Security Gates", icon: Key },
        { id: "menus", label: "UI Contexts", icon: Layout },
    ]

    const currentIndex = tabs.findIndex(t => t.id === activeTab)
    const progress = ((currentIndex + 1) / tabs.length) * 100

    const filteredPermissions = allPermissions.filter(p =>
        p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(permSearch.toLowerCase())
    )

    const permissionsByModule = filteredPermissions.reduce((acc: any, p: any) => {
        const moduleName = p.module?.name || "Global Core"
        if (!acc[moduleName]) acc[moduleName] = []
        acc[moduleName].push(p)
        return acc
    }, {})

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-5">
                    {/* Synchronized Step Indicator */}
                    <div className="flex items-center gap-4 px-1">
                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Terminal className="h-3 w-3" /> Section {currentIndex + 1}: {tabs[currentIndex].label}
                                </span>
                                <span className="text-[9px] font-bold text-muted-foreground tabular-nums opacity-60">{Math.round(progress)}% Integrated</span>
                            </div>
                            <Progress value={progress} className="h-1 bg-primary/10" />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-col xl:flex-row gap-6">
                            <TabsList className="flex xl:flex-col h-auto bg-transparent p-0 gap-1 justify-start self-start shrink-0 overflow-x-auto no-scrollbar max-w-full pb-2 xl:pb-0">
                                {tabs.map((tab) => {
                                    const hasError = form.formState.errors[tab.id as keyof z.infer<typeof roleSchema>]
                                    return (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className={cn(
                                                "flex items-center gap-2.5 px-4 py-3 rounded-xl border border-transparent text-[10px] font-bold transition-all data-[state=active]:bg-card data-[state=active]:border-muted/30 data-[state=active]:shadow-md data-[state=active]:text-primary hover:bg-muted/30 w-full xl:min-w-[180px] justify-start text-muted-foreground whitespace-nowrap",
                                                hasError && "border-destructive/30 text-destructive bg-destructive/[0.02]"
                                            )}
                                        >
                                            <tab.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", activeTab === tab.id ? "text-primary" : "text-muted-foreground/50")} />
                                            <span>{tab.label}</span>
                                        </TabsTrigger>
                                    )
                                })}
                            </TabsList>

                            <div className="flex-1 bg-muted/5 rounded-[1.5rem] border border-muted/20 p-5 sm:p-7 backdrop-blur-sm min-h-[400px] shadow-inner relative overflow-hidden">
                                {fetchingDeps && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-md z-20">
                                        <Activity className="h-5 w-5 animate-spin text-primary" />
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Hydrating Infrastructure...</p>
                                    </div>
                                )}

                                {!fetchingDeps && (
                                    <>
                                        <TabsContent value="general" className="mt-0 space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-3.5 mb-6 p-4 rounded-xl bg-primary/[0.03] border border-primary/10">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                                    <Info className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[11px] font-black tracking-tight text-foreground uppercase opacity-80">Registry Header</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium truncate">Primary identity parameters.</p>
                                                </div>
                                                <div className="ml-auto flex items-center gap-3">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Status</span>
                                                        <span className={cn("text-[9px] font-bold", form.watch("isActive") ? "text-emerald-500" : "text-orange-500")}>
                                                            {form.watch("isActive") ? "ACTIVE" : "SUSPENDED"}
                                                        </span>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="isActive"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        disabled={isEdit && editData?.isSystem}
                                                                        className="scale-75 data-[state=checked]:bg-emerald-500"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-5 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Friendly Designation</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. Lead Engineer" {...field} className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all font-bold text-[11px]" />
                                                            </FormControl>
                                                            <FormMessage className="text-[9px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">System Hash / Code</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="e.g. lead_engineer"
                                                                    {...field}
                                                                    disabled={editData?.isSystem}
                                                                    className="h-10 rounded-lg bg-background border-muted/30 font-mono text-[10px] focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:font-normal"
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-[8px] font-medium leading-relaxed opacity-50">Immutable for system core tiers.</FormDescription>
                                                            <FormMessage className="text-[9px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Strategic Scope</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Define the specific operational reach..."
                                                                className="min-h-[120px] rounded-xl bg-background border-muted/30 resize-none focus:ring-1 focus:ring-primary/20 text-[11px] font-medium leading-normal transition-all shadow-inner p-3"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[9px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>

                                        <TabsContent value="permissions" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-sm">
                                                        <Key className="h-3.5 w-3.5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black tracking-tighter uppercase opacity-80">Grant Matrix</h4>
                                                        <p className="text-[9px] text-muted-foreground font-bold tracking-tight">{form.watch("permissionIds").length} GATES ACTIVE</p>
                                                    </div>
                                                </div>
                                                <div className="relative w-full sm:w-48 group">
                                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                                    <Input
                                                        placeholder="Filter gates..."
                                                        value={permSearch}
                                                        onChange={(e) => setPermSearch(e.target.value)}
                                                        className="h-8 pl-8 text-[10px] bg-background border-muted/30 rounded-lg focus:ring-1 focus:ring-primary/20"
                                                    />
                                                </div>
                                            </div>

                                            <ScrollArea className="h-[340px] -mx-2 px-2">
                                                <div className="space-y-6 pb-4">
                                                    {Object.keys(permissionsByModule).length > 0 ? (
                                                        Object.entries(permissionsByModule).map(([moduleName, perms]: [string, any]) => (
                                                            <div key={moduleName} className="space-y-3">
                                                                <div className="flex items-center gap-2 mb-1 px-1">
                                                                    <div className="h-4 w-0.5 rounded-full bg-primary/40" />
                                                                    <h5 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] opacity-70">{moduleName}</h5>
                                                                    <Badge variant="outline" className="text-[7px] font-black uppercase bg-muted/20 border-muted/30 h-3.5 px-1">{perms.length}</Badge>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {perms.map((perm: any) => (
                                                                        <label
                                                                            key={perm.id}
                                                                            className={cn(
                                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-background group relative overflow-hidden",
                                                                                form.watch("permissionIds").includes(perm.id)
                                                                                    ? "bg-background border-primary/30 shadow-sm"
                                                                                    : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                                                            )}
                                                                        >
                                                                            <Checkbox
                                                                                checked={form.watch("permissionIds").includes(perm.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const current = form.getValues("permissionIds")
                                                                                    if (checked) {
                                                                                        form.setValue("permissionIds", [...current, perm.id])
                                                                                    } else {
                                                                                        form.setValue("permissionIds", current.filter(id => id !== perm.id))
                                                                                    }
                                                                                }}
                                                                                className="rounded-md h-4 w-4 border-muted/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                            />
                                                                            <div className="flex flex-col min-w-0 relative z-10">
                                                                                <span className="text-[11px] font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">{perm.name}</span>
                                                                                <span className="text-[8px] font-mono text-muted-foreground tracking-tighter truncate uppercase opacity-50">{perm.code}</span>
                                                                            </div>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-16 opacity-30">
                                                            <ShieldAlert className="h-8 w-8 mb-2 opacity-20" />
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Zero Matching Gates</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="menus" className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                                                    <Layout className="h-3.5 w-3.5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black tracking-tight uppercase opacity-80">Navigation Protocol</h4>
                                                    <p className="text-[9px] text-muted-foreground font-bold tracking-tight">Toggle visibility for console interfaces.</p>
                                                </div>
                                            </div>

                                            <ScrollArea className="h-[340px] -mx-2 px-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                                                    {allMenus.length > 0 ? (
                                                        allMenus.map((menu: any) => (
                                                            <label
                                                                key={menu.id}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                                                                    form.watch("menuIds").includes(menu.id)
                                                                        ? "bg-background border-emerald-500/30 shadow-sm"
                                                                        : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                                                )}
                                                            >
                                                                <Checkbox
                                                                    checked={form.watch("menuIds").includes(menu.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = form.getValues("menuIds")
                                                                        if (checked) {
                                                                            form.setValue("menuIds", [...current, menu.id])
                                                                        } else {
                                                                            form.setValue("menuIds", current.filter(id => id !== menu.id))
                                                                        }
                                                                    }}
                                                                    className="h-4 w-4 border-muted/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-md"
                                                                />
                                                                <div className="flex flex-col min-w-0 relative z-10">
                                                                    <span className="text-[11px] font-bold text-foreground leading-tight group-hover:text-emerald-500 transition-colors uppercase truncate">{menu.title}</span>
                                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                                        <span className="text-[8px] text-muted-foreground font-mono truncate">{menu.path || "#"}</span>
                                                                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                                                                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{menu.permissionCode || "Public"}</span>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-2 py-16 text-center opacity-30 italic text-[9px] font-black uppercase tracking-[0.2em]">Console Contexts Empty</div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Control Strip */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-muted/20">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onCancel}
                                    className="h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-muted/50 transition-all opacity-60 hover:opacity-100 flex-1 sm:flex-initial"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Discard
                                </Button>
                                {activeTab !== "general" && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const prev = currentIndex === 0 ? "general" : tabs[currentIndex - 1].id
                                            setActiveTab(prev)
                                        }}
                                        className="h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 border-muted/30 hover:bg-muted/20 transition-all flex-1 sm:flex-initial"
                                    >
                                        Back
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {activeTab !== "menus" ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const next = tabs[currentIndex + 1].id
                                            setActiveTab(next)
                                        }}
                                        className="h-10 px-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md active:scale-95 group w-full sm:w-auto"
                                    >
                                        Next Phase <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 duration-300" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="h-11 px-10 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2.5 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:translate-y-[-1px] transition-all hover:shadow-primary/40 relative overflow-hidden group w-full sm:w-auto"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        <span className="relative z-10">{isEdit ? "Update Archetype" : "Deploy Protocol"}</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Tabs>
                </div>
            </form>
        </Form>
    )
}
