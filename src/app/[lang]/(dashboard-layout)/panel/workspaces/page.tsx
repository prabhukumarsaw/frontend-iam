"use client"

import { useState } from "react"
import { TenantList } from "./_components/tenant-list"
import { TenantForm } from "./_components/tenant-form"
import { TenantDetails } from "./_components/tenant-details"
import { Button } from "@/components/ui/button"
import { Plus, LayoutPanelLeft, Box } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

export default function TenantManagementPage() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [editingTenant, setEditingTenant] = useState<any>(null)
    const [viewingTenant, setViewingTenant] = useState<any>(null)
    const [refreshSignal, setRefreshSignal] = useState(0)

    function handleCreate() {
        setEditingTenant(null)
        setIsFormOpen(true)
    }

    function handleEdit(tenant: any) {
        setEditingTenant(tenant)
        setIsFormOpen(true)
    }

    function handleView(tenant: any) {
        setViewingTenant(tenant)
        setIsDetailsOpen(true)
    }

    function handleSuccess() {
        setIsFormOpen(false)
        setRefreshSignal((s) => s + 1)
    }

    return (
        <div className="flex flex-col gap-6 min-h-screen pb-10 px-4 md:px-0">
            {/* Clean Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
                <div className="space-y-1 min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight truncate">
                        Workspace Management
                    </h1>
                    <p className="text-sm text-muted-foreground truncate sm:whitespace-normal">
                        Manage and monitor your application environments and tenant nodes.
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="gap-2 shrink-0 w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Create Workspace
                </Button>
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
                <TenantList
                    onEdit={handleEdit}
                    onView={handleView}
                    refreshSignal={refreshSignal}
                />
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
                    <DialogHeader>
                        <DialogTitle>{editingTenant ? "Edit Workspace" : "Create Workspace"}</DialogTitle>
                        <DialogDescription>
                            {editingTenant
                                ? "Update the configuration for this tenant node."
                                : "Add a new isolated workspace to your environment."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 overflow-y-auto max-h-[70vh]">
                        <TenantForm
                            initialData={editingTenant}
                            onSuccess={handleSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Details Sheet */}
            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <SheetContent className="sm:max-w-xl w-full flex flex-col h-full overflow-hidden p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <div className="flex items-center gap-3">
                            <LayoutPanelLeft className="h-5 w-5 text-primary" />
                            <SheetTitle className="text-xl">Workspace Details</SheetTitle>
                        </div>
                        <SheetDescription>
                            Detailed view of node configuration and runtime status.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-hidden p-6">
                        {viewingTenant && <TenantDetails tenantId={viewingTenant.id} />}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}


