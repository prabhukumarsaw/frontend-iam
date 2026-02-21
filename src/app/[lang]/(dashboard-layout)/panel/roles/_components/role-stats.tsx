"use client"

import {
    Shield,
    CheckCircle2,
    Lock,
    Ban
} from "lucide-react"
import { StatsDeck, StatItem } from "@/components/layout/stats-deck"

interface RoleStatsProps {
    total: number
    active: number
    system: number
    suspended: number
}

export function RoleStats({ total, active, system, suspended }: RoleStatsProps) {
    const stats: StatItem[] = [
        {
            title: "Total Roles",
            value: total,
            icon: Shield,
            color: "primary",
            description: "Security Archetypes"
        },
        {
            title: "Active Protocols",
            value: active,
            icon: CheckCircle2,
            color: "emerald-500",
            description: "Currently Deployed",
            suffix: "Live"
        },
        {
            title: "System Core",
            value: system,
            icon: Lock,
            color: "blue-500",
            description: "Immutable",
            suffix: "Locked"
        },
        {
            title: "Suspended",
            value: suspended,
            icon: Ban,
            color: "slate-500",
            description: "Deactivated"
        }
    ]

    return <StatsDeck stats={stats} />
}
