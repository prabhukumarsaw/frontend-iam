"use client"

import { ShieldCheck, Activity, Zap, Server } from "lucide-react"
import { StatsDeck, StatItem } from "@/components/layout/stats-deck"

interface TenantStatsProps {
    tenants: any[]
}

export function TenantStats({ tenants }: TenantStatsProps) {
    const total = tenants.length
    const active = tenants.filter((t) => t.isActive).length
    const inactive = total - active
    const health = total > 0 ? Math.round((active / total) * 100) : 0

    const stats: StatItem[] = [
        {
            title: "Workspaces",
            value: total,
            icon: Server,
            color: "primary",
            description: "Registered nodes"
        },
        {
            title: "Operational",
            value: active,
            icon: ShieldCheck,
            color: "emerald-500",
            description: "Active systems",
            suffix: "Sync"
        },
        {
            title: "Maintenance",
            value: inactive,
            icon: Activity,
            color: "amber-500",
            description: "Dormant states"
        },
        {
            title: "Availability",
            value: `${health}%`,
            icon: Zap,
            color: "blue-500",
            description: "Current uptime",
            suffix: "UP"
        }
    ]

    return <StatsDeck stats={stats} />
}
