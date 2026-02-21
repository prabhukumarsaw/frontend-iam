"use client"

import { useEffect, useState, useCallback } from "react"
import { apiRequest } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { RoleStats } from "./role-stats"
import { RoleTable } from "./role-table"
import { RoleForm } from "./role-form"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogDescription
} from "@/components/ui/dialog"
import { Shield, Activity } from "lucide-react"

export function RolesList() {
    const { toast } = useToast()
    const [roles, setRoles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Server-side state
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")

    // UI state
    const [editingRole, setEditingRole] = useState<any>(null)
    const [refreshSignal, setRefreshSignal] = useState(0)

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            queryParams.append("page", page.toString())
            queryParams.append("limit", limit.toString())
            queryParams.append("includeStats", "true")
            if (search) queryParams.append("search", search)

            const res = await apiRequest(`/roles?${queryParams.toString()}`)
            setRoles(res.data.roles || [])
            setTotal(res.data.total || 0)
        } catch (error) {
            console.error("Failed to fetch roles", error)
            toast({
                variant: "destructive",
                title: "Registry Sync Offline",
                description: "Could not establish a stable connection with the security engine."
            })
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, toast])

    useEffect(() => {
        fetchRoles()
    }, [fetchRoles, refreshSignal])

    const handleToggleStatus = async (role: any) => {
        try {
            setLoading(true)
            await apiRequest(`/roles/${role.id}/toggle-status`, {
                method: "PATCH",
                body: { isActive: !role.isActive }
            })

            toast({
                title: "Protocol Shifted",
                description: `Identity archetype "${role.name}" has been successfully ${!role.isActive ? 'activated' : 'suspended'}.`
            })

            setRefreshSignal(s => s + 1)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Security Logic Fault",
                description: error.message || "The engine rejected the protocol shift."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (role: any) => {
        if (!confirm(`CAUTION: Permanently purge role "${role.name}"? This will terminate access for all linked users.`)) {
            return
        }

        try {
            setLoading(true)
            await apiRequest(`/roles/${role.id}`, { method: "DELETE" })

            toast({
                title: "Archetype Purged",
                description: "Digital record has been permanently removed from the platform registry."
            })

            setRefreshSignal(s => s + 1)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Purge Inhibit",
                description: error.message || "Core role integrity check failed."
            })
        } finally {
            setLoading(false)
        }
    }

    const systemRoles = roles.filter(r => r.isSystem).length
    const activeRoles = roles.filter(r => r.isActive).length
    const suspendedRoles = roles.filter(r => !r.isActive).length

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <RoleStats
                total={total}
                active={activeRoles}
                system={systemRoles}
                suspended={suspendedRoles}
            />

            <RoleTable
                data={roles}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                search={search}
                onSearchChange={setSearch}
                onRefresh={() => setRefreshSignal(s => s + 1)}
                onEdit={setEditingRole}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                isLoading={loading}
            />

            {/* Global Evolution Interface (Edit Modal) */}
            <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
                <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-muted/20 gap-0 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                        {/* Static Branding Panel */}
                        <div className="hidden md:flex flex-col w-[340px] bg-muted/30 border-r border-muted/10 p-10 pt-14 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 p-48 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                            <div className="mb-12 relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8 shadow-sm">
                                    <Shield className="h-8 w-8 text-primary" />
                                </div>
                                <DialogTitle className="text-3xl font-black tracking-tighter text-foreground leading-[1.1] mb-4">Update Security<br />Architecture</DialogTitle>
                                <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed pr-2 font-medium opacity-80">
                                    You are re-engineering the <span className="text-primary font-bold">"{editingRole?.name}"</span> blueprint.
                                    Changes propagate instantly through the network.
                                </DialogDescription>
                            </div>

                            <div className="space-y-8 mt-4 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Atomic Consistency</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                                        Modifying gates will audit all active sessions dependent on this tier.
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-4 border-l-2 border-blue-500/20">
                                        System-locked codes are protected to maintain structural platform stability.
                                    </p>
                                </div>

                            </div>

                            <div className="mt-auto pt-12 relative z-10">
                                <div className="p-5 rounded-2xl bg-card border border-muted/40 shadow-sm backdrop-blur-md">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Core Sync Active</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                                        Global security parameters are under active synchronization.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Engineering Panel */}
                        <div className="flex-1 p-8 md:p-12 bg-background relative overflow-y-auto custom-scrollbar">
                            <RoleForm
                                editData={editingRole}
                                onSuccess={() => {
                                    setEditingRole(null)
                                    setRefreshSignal(s => s + 1)
                                }}
                                onCancel={() => setEditingRole(null)}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
