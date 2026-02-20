"use client"

import { Users, ShieldCheck, ShieldAlert, Zap } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TenantStatsProps {
    tenants: any[]
}

export function TenantStats({ tenants }: TenantStatsProps) {
    const total = tenants.length
    const active = tenants.filter((t) => t.isActive).length
    const inactive = total - active
    const health = total > 0 ? Math.round((active / total) * 100) : 0

    const stats = [
        {
            title: "Total Workspaces",
            value: total,
            description: "Registered tenants",
            icon: Users,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Active Nodes",
            value: active,
            description: "Operational systems",
            icon: ShieldCheck,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Dormant States",
            value: inactive,
            description: "Inactive or pending",
            icon: ShieldAlert,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            title: "System Health",
            value: `${health}%`,
            description: "Overall utilization",
            icon: Zap,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-500/10"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-none border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {stat.title}
                        </CardTitle>
                        <div className={cn("p-2 rounded-md", stat.bgColor)}>
                            <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

