"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { apiRequest } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Activity, LayoutTemplate, Save, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const menuSchema = z.object({
    title: z.string().min(1, "Designation is required").max(100),
    path: z.string().optional(),
    icon: z.string().optional(),
    parentId: z.string().optional(),
    moduleId: z.string().optional(),
    order: z.coerce.number().optional(),
    permissionCode: z.string().optional(),
    isActive: z.boolean().default(true),
})

type MenuFormProps = {
    onSuccess: () => void
    onCancel: () => void
    editData?: any
}

export function MenuForm({ onSuccess, onCancel, editData }: MenuFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fetchingDeps, setFetchingDeps] = useState(true)

    // Dependencies
    const [allMenus, setAllMenus] = useState<any[]>([])
    const [modules, setModules] = useState<any[]>([])
    const [permissions, setPermissions] = useState<any[]>([])

    const isEdit = !!editData

    const form = useForm<z.infer<typeof menuSchema>>({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            title: editData?.title || "",
            path: editData?.path || "",
            icon: editData?.icon || "",
            parentId: editData?.parentId || undefined,
            moduleId: editData?.moduleId || undefined,
            order: editData?.order || 0,
            permissionCode: editData?.permissionCode || "",
            isActive: editData ? editData.isActive : true,
        },
    })

    useEffect(() => {
        async function fetchDeps() {
            setFetchingDeps(true)
            try {
                const [menusRes, permRes] = await Promise.all([
                    apiRequest("/menus"),
                    apiRequest("/permissions")
                ])

                const validParents = (menusRes.data?.menus || []).filter((m: any) => m.id !== editData?.id)
                setAllMenus(validParents)

                // Assuming permissions API returns a structured list or flat list
                setPermissions(permRes.data?.permissions || [])

                // Modules can be fetched if you have a module endpoint, for now we will stub it or retrieve from permissions
                const modsMap = new Map()
                    ; (permRes.data?.permissions || []).forEach((p: any) => {
                        if (p.module) modsMap.set(p.module.id, p.module)
                    })
                setModules(Array.from(modsMap.values()))
            } catch (error) {
                console.error("Failed to fetch dependencies", error)
            } finally {
                setFetchingDeps(false)
            }
        }
        fetchDeps()
    }, [editData])

    async function onSubmit(values: z.infer<typeof menuSchema>) {
        try {
            setLoading(true)
            const payload: any = {
                ...values,
                path: values.path?.trim() || null,
                icon: values.icon?.trim() || null,
                order: Number(values.order) || 0,
            }

            if (!payload.parentId || payload.parentId === "root") payload.parentId = null
            if (!payload.moduleId || payload.moduleId === "none") payload.moduleId = null
            if (!payload.permissionCode || payload.permissionCode === "public") payload.permissionCode = null


            if (isEdit) {
                await apiRequest(`/menus/${editData.id}`, {
                    method: "PATCH",
                    body: payload,
                })
            } else {
                await apiRequest("/menus", {
                    method: "POST",
                    body: payload,
                })
            }
            toast({
                title: isEdit ? "Node Protocol Updated" : "Node Initialized",
                description: `Hierarchy node sequence ${isEdit ? "updated" : "created"} successfully.`,
            })
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Operation Incomplete",
                description: error.data?.message || "Failed to commit node sequence.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (fetchingDeps) {
        return (
            <div className="flex flex-col items-center justify-center p-20 opacity-40">
                <Activity className="h-6 w-6 animate-spin text-primary mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hydrating Topology...</p>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-muted/5 rounded-[1.5rem] border border-muted/20 p-5 sm:p-7 backdrop-blur-sm shadow-inner relative overflow-hidden space-y-5">

                    <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-primary/[0.03] border border-primary/10">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                            <LayoutTemplate className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black tracking-tight text-foreground uppercase opacity-90">Core Parameters</h4>
                            <p className="text-[10px] text-muted-foreground font-medium truncate">Primary identification and hierarchy attachment.</p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Status</span>
                                <span className={form.watch("isActive") ? "text-[9px] font-bold text-emerald-500" : "text-[9px] font-bold text-orange-500"}>
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
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Node Designation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Dashboard, Settings..." {...field} className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all font-bold text-[11px]" />
                                    </FormControl>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="path"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Routing Strategy (Path)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. /panel/dashboard"
                                            {...field}
                                            className="h-10 rounded-lg bg-background border-muted/30 font-mono text-[10px] focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:font-normal"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Hierarchy Attachment (Parent)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "root"}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all text-[11px] font-bold">
                                                <SelectValue placeholder="Select Parent Node (Root level implied)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px] bg-background/95 backdrop-blur-xl border-muted/20 rounded-xl">
                                            <SelectItem value="root" className="text-[11px] font-bold italic text-muted-foreground/70">Top Level (Root Group)</SelectItem>
                                            {allMenus.sort((a, b) => a.title.localeCompare(b.title)).map((m: any) => (
                                                <SelectItem key={m.id} value={m.id} className="text-[11px] font-bold">
                                                    {m.parentId ? `↳ ${m.title}` : m.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-[9px] font-medium opacity-60">
                                        Sub-nodes will inherit visibility constraints from their parent by default.
                                    </FormDescription>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="permissionCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Visibility Binding (Security Gate)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "public"}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all text-[11px] font-bold font-mono">
                                                <SelectValue placeholder="Select Permission Anchor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="public" className="text-[10px] uppercase font-black tracking-widest italic text-muted-foreground/50">Public Interface</SelectItem>
                                            {permissions.map((p: any) => (
                                                <SelectItem key={p.code} value={p.code} className="text-[10px] font-mono">
                                                    {p.code} ({p.name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Icon Identifier</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Activity" {...field} className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all font-mono text-[10px] font-bold" />
                                    </FormControl>
                                    <FormDescription className="text-[8px] font-medium opacity-50">Lucide rect icon name.</FormDescription>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Render Priority</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all font-mono text-[10px] tabular-nums font-bold" />
                                    </FormControl>
                                    <FormDescription className="text-[8px] font-medium opacity-50">Lower renders first.</FormDescription>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="moduleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">Target Module Core</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-lg bg-background border-muted/30 focus:ring-1 focus:ring-primary/20 transition-all text-[11px] font-bold">
                                                <SelectValue placeholder="Isolated / Global" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px] bg-background/95 backdrop-blur-xl border-muted/20 rounded-xl">
                                            <SelectItem value="none" className="text-[11px] font-bold italic text-muted-foreground/70">Isolated / Global</SelectItem>
                                            {modules.map((m: any) => (
                                                <SelectItem key={m.id} value={m.id} className="text-[11px] font-bold">
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-[8px] font-medium opacity-50">Optional logical grouping.</FormDescription>
                                    <FormMessage className="text-[9px]" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-muted/20">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-muted/50 transition-all opacity-60 hover:opacity-100 flex-1 sm:flex-initial"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" /> Discard
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-10 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2.5 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:translate-y-[-1px] transition-all hover:shadow-primary/40 relative overflow-hidden group w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span className="relative z-10">{isEdit ? "Synchronize Settings" : "Deploy Protocol"}</span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
