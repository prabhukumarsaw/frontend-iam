"use client"

import { Users, UserCheck, UserMinus, ShieldAlert } from "lucide-react"
import { StatsDeck, StatItem } from "@/components/layout/stats-deck"

interface UserStatsProps {
    total: number
    active: number
    inactive: number
    verified: number
}

export function UserStats({ total, active, inactive, verified }: UserStatsProps) {
    const stats: StatItem[] = [
        {
            title: "Total Identities",
            value: total,
            icon: Users,
            color: "primary",
            description: "Cross-platform records"
        },
        {
            title: "Active Users",
            value: active,
            icon: UserCheck,
            color: "emerald-500",
            description: "Currently operational",
            suffix: "Live"
        },
        {
            title: "Dormant",
            value: inactive,
            icon: UserMinus,
            color: "slate-500",
            description: "Awaiting activation"
        },
        {
            title: "Security Verified",
            value: verified,
            icon: ShieldAlert,
            color: "blue-500",
            description: "Email confirmed",
            suffix: "SEC"
        }
    ]

    return <StatsDeck stats={stats} />
}
