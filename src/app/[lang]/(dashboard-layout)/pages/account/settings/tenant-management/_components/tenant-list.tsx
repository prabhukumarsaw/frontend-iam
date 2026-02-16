"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TenantListProps {
    onEdit: (tenant: any) => void
    refreshSignal: number
}

export function TenantList({ onEdit, refreshSignal }: TenantListProps) {
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchTenants() {
        try {
            setLoading(true)
            const res = await apiRequest("/tenants")
            setTenants(res.data.tenants || [])
        } catch (error) {
            console.error("Failed to fetch tenants", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTenants()
    }, [refreshSignal])

    if (loading) {
        return <div className="flex justify-center p-8"><RefreshCcw className="animate-spin" /></div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell className="font-medium">{tenant.name}</TableCell>
                            <TableCell>{tenant.slug}</TableCell>
                            <TableCell>{tenant.domain || "-"}</TableCell>
                            <TableCell>
                                <Badge variant={tenant.isActive ? "default" : "secondary"}>
                                    {tenant.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(tenant)}>
                                    <Edit className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tenants.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No tenants found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
