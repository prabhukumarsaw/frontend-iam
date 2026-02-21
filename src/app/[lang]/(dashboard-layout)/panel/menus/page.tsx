"use client"

import { useState } from "react"
import { MenusList } from "./_components/menus-list"
import { MenuForm } from "./_components/menu-form"
import { Button } from "@/components/ui/button"
import { Plus, LayoutTemplate, Network, LayoutGrid, Sparkles } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/layout/page-header"

export default function MenusPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [refreshSignal, setRefreshSignal] = useState(0)

    const headerActions = (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button
                    className="gap-2.5 w-full lg:w-auto h-11 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all hover:translate-y-[-2px] hover:shadow-primary/25 font-black text-[10px] uppercase tracking-[0.12em] bg-primary text-primary-foreground relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Plus className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Deploy Node</span>
                    <Sparkles className="h-3 w-3 text-primary-foreground/50 ml-0.5 group-hover:animate-pulse relative z-10" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-muted/20 gap-0 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Intelligence Panel */}
                    <div className="hidden md:flex flex-col w-[340px] bg-muted/20 border-r border-muted/10 p-10 pt-16 relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-40 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="mb-12 relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8 shadow-sm">
                                <Network className="h-8 w-8 text-primary" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-[1.1] mb-4">Initialize<br />Navigation Node</DialogTitle>
                            <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed font-medium opacity-80">
                                Engineer a new structural node within the platform hierarchy. Bind visibility to operational gates.
                            </DialogDescription>
                        </div>

                        <div className="space-y-8 relative z-10 mt-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all animate-pulse" />
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Hierarchy Core</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20 font-medium">
                                    Nodes can be primary or nested. Establishing correct
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed pl-4 border-l-2 border-orange-500/20 font-medium">
                                    Attach a specific permission code
                                </p>
                            </div>

                        </div>

                        <div className="mt-auto pt-16 relative z-10">
                            <div className="p-5 rounded-2xl bg-card border border-muted/30 shadow-xl backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Interface Principle</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold tracking-tight italic">
                                    "Architecture defines experience. Build logical trees, not flat lists."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex-1 p-6 sm:p-10 bg-background relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader className="mb-10 md:hidden">
                            <DialogTitle className="text-2xl font-black tracking-tight">Provision Node</DialogTitle>
                            <DialogDescription className="text-sm mt-2 font-medium">
                                Initialize a structure node for your ecosystem.
                            </DialogDescription>
                        </DialogHeader>

                        <MenuForm
                            onSuccess={() => {
                                setIsCreateOpen(false)
                                setRefreshSignal(s => s + 1)
                            }}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="flex flex-col gap-10 min-h-screen pb-20 px-4 md:px-0 animate-in fade-in duration-1000">
            <PageHeader
                title="Interface Architecture"
                description="Design and manage the structural topology of the user console. Construct multi-level nested navigation hierarchies and bind them dynamically to structural security gates."
                badge="System Structure"
                icon={LayoutTemplate}
                actions={headerActions}
            />

            <div className="flex-1 min-w-0">
                <MenusList key={refreshSignal} />
            </div>
        </div>
    )
}
