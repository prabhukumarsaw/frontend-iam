"use client"

import { useState } from "react"
import { TenantList } from "./_components/tenant-list"
import { TenantForm } from "./_components/tenant-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Tenant Management</CardTitle>
                        <CardDescription>
                            Create and manage workspace tenants for your application.
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="size-4" />
                        Add Tenant
                    </Button>
                </CardHeader>
                <CardContent>
                    <TenantList onEdit={handleEdit} refreshSignal={refreshSignal} />
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTenant ? "Edit Tenant" : "Create New Tenant"}</DialogTitle>
                        <DialogDescription>
                            {editingTenant
                                ? "Update the tenant details below."
                                : "Fill in the details to create a new workspace tenant."}
                        </DialogDescription>
                    </DialogHeader>
                    <TenantForm
                        initialData={editingTenant}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
