"use client"

import { useState } from "react"
import { TenantList } from "./_components/tenant-list"
import { TenantForm } from "./_components/tenant-form"
import { Button } from "@/components/ui/button"
import { Plus, Server } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/layout/page-header"

export default function TenantManagementPage() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTenant, setEditingTenant] = useState<any>(null)
    const [refreshSignal, setRefreshSignal] = useState(0)

    function handleCreate() {
        setEditingTenant(null)
        setIsFormOpen(true)
    }

    function handleEdit(tenant: any) {
        setEditingTenant(tenant)
        setIsFormOpen(true)
    }

    function handleSuccess() {
        setIsFormOpen(false)
        setRefreshSignal((s) => s + 1)
    }

    const headerActions = (
        <Button
            onClick={handleCreate}
            className="gap-2.5 w-full sm:w-auto h-11 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all hover:translate-y-[-2px] hover:shadow-primary/25 font-black text-[10px] uppercase tracking-[0.12em] bg-primary text-primary-foreground relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus className="h-4 w-4 relative z-10" />
            <span className="relative z-10">New Workspace</span>
        </Button>
    )

    return (
        <div className="flex flex-col gap-10 min-h-screen pb-20 px-4 md:px-0 animate-in fade-in duration-1000">
            <PageHeader
                title="Workspaces"
                description="Orchestrate your application nodes and tenant environments. Monitor health, manage permissions, and scale infrastructure from a unified interface."
                badge="Environment Control"
                icon={Server}
                actions={headerActions}
            />

            <div className="flex-1 min-w-0">
                <TenantList
                    onEdit={handleEdit}
                    refreshSignal={refreshSignal}
                />
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full border-none shadow-2xl p-0 overflow-hidden rounded-[2rem] bg-background/95 backdrop-blur-xl">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight">{editingTenant ? "Update Configuration" : "Provision Workspace"}</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium text-xs mt-2 opacity-80">
                                {editingTenant
                                    ? "Modify the existing node parameters for this workspace environment."
                                    : "Define a new isolated node to expand your application reach."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 overflow-y-auto max-h-[70vh]">
                        <TenantForm
                            initialData={editingTenant}
                            onSuccess={handleSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
