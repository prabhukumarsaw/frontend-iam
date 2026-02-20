"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api/client"
import { RefreshCcw } from "lucide-react"
import { TenantStats } from "./tenant-stats"
import { TenantTable } from "./tenant-table"

interface TenantListProps {
    onEdit: (tenant: any) => void
    onView: (tenant: any) => void
    refreshSignal: number
}

export function TenantList({ onEdit, onView, refreshSignal }: TenantListProps) {
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
        <div className="space-y-8">
            <TenantStats tenants={tenants} />
            <div className="space-y-4">
                <TenantTable data={tenants} onEdit={onEdit} onView={onView} />
            </div>
        </div>
    )
}
