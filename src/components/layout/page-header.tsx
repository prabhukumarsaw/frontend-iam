"use client"

import * as React from "react"
import { LucideIcon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
    title: string
    description: string
    badge?: string
    icon?: LucideIcon
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    badge,
    icon: Icon,
    actions,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-1.5 pt-6 pb-5 relative", className)}>
            {/* Minimalist Background Layer */}
            <div className="absolute top-0 left-0 w-full h-[240px] bg-gradient-to-b from-primary/[0.04] to-transparent -z-10 pointer-events-none" />

            {/* Compact Indicator */}
            {badge && (
                <div className="flex items-center gap-2.5 mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm backdrop-blur-md">
                        {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="h-[1px] w-5 bg-muted/20" />
                    <Badge
                        variant="outline"
                        className="text-[8px] font-black uppercase tracking-[0.25em] border-primary/25 bg-primary/5 text-primary h-4.5 px-2 leading-none"
                    >
                        {badge}
                    </Badge>
                </div>
            )}

            {/* Structured Content Area */}
            <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-5 lg:gap-8">
                <div className="space-y-2 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight">
                        {title}
                    </h1>
                    <p className="text-[11px] sm:text-[12px] text-muted-foreground max-w-2xl leading-relaxed font-semibold opacity-70">
                        {description}
                    </p>
                </div>

                {actions && (
                    <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 animate-in fade-in zoom-in-95 duration-500 mt-2 xl:mt-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
