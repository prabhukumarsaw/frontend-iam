"use client"

import * as React from "react"
import { LucideIcon, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatItem {
    title: string
    value: string | number
    icon: LucideIcon
    color?: string // "primary", "emerald-500", "blue-500", etc.
    description?: string
    suffix?: string
}

interface StatsDeckProps {
    stats: StatItem[]
    className?: string
}

export function StatsDeck({ stats, className }: StatsDeckProps) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="p-4 rounded-xl border border-muted/20 bg-card shadow-sm group hover:ring-1 hover:ring-primary/20 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 duration-300",
                            stat.color === "primary" ? "bg-primary/10 border-primary/20 text-primary" :
                                (stat.color ? `bg-${stat.color.split('-')[0]}-500/10 border-${stat.color.split('-')[0]}-500/20 text-${stat.color}` : "bg-muted/40 border-muted/20 text-foreground")
                        )}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <Activity className="h-4 w-4 text-muted-foreground opacity-10 group-hover:opacity-30 transition-opacity" />
                    </div>

                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</p>
                        <div className="flex items-end gap-1.5 text-foreground">
                            <p className="text-2xl font-black tracking-tighter tabular-nums">{stat.value}</p>
                            {stat.suffix && (
                                <span className={cn(
                                    "text-[9px] font-bold mb-1 opacity-80 uppercase tracking-widest",
                                    stat.color === "primary" ? "text-primary" : (stat.color ? `text-${stat.color}` : "text-muted-foreground")
                                )}>
                                    {stat.suffix}
                                </span>
                            )}
                        </div>
                        {stat.description && (
                            <p className="text-[10px] font-medium text-muted-foreground/60">{stat.description}</p>
                        )}
                    </div>

                    {/* Subtle underline hover effect */}
                    <div className={cn(
                        "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500",
                        stat.color === "primary" ? "bg-primary" : (stat.color ? `bg-${stat.color}` : "bg-muted-foreground/20")
                    )} />
                </div>
            ))}
        </div>
    )
}
