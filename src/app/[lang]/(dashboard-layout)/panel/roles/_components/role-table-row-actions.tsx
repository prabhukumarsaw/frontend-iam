"use client"

import { Row } from "@tanstack/react-table"
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Ban,
    CheckCircle2,
    Copy,
    Fingerprint,
    ShieldAlert,
    Power
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface RoleTableRowActionsProps {
    row: Row<any>
    onEdit: (role: any) => void
    onDelete: (role: any) => void
    onToggleStatus: (role: any) => void
}

export function RoleTableRowActions({
    row,
    onEdit,
    onDelete,
    onToggleStatus
}: RoleTableRowActionsProps) {
    const role = row.original

    const copyCode = () => {
        navigator.clipboard.writeText(role.code)
    }

    const isSystem = role.isSystem
    const isActive = role.isActive

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted/60 transition-colors rounded-xl border border-transparent hover:border-muted/20 shadow-none hover:shadow-sm"
                >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] p-2 bg-background border-muted/20 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.2)] rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="px-3 py-2.5 mb-1.5 border-b border-muted/10 bg-muted/5 rounded-t-xl -mt-2 -mx-2">
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 opacity-40 text-primary" /> Authority Protocol
                    </p>
                </div>

                <DropdownMenuItem
                    onClick={() => onEdit(role)}
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-primary/5 hover:text-primary font-bold text-[11px] transition-all group"
                >
                    <Edit className="h-4 w-4 text-blue-500/50 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                    Configure Blueprint
                    <DropdownMenuShortcut className="tracking-widest opacity-20 group-hover:opacity-100">EDIT</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={copyCode}
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-muted font-bold text-[11px] transition-all group"
                >
                    <Copy className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-all" />
                    Clone System Code
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-muted/10 my-1" />

                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full">
                                <DropdownMenuItem
                                    onClick={() => onToggleStatus(role)}
                                    disabled={isSystem && isActive}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-muted font-bold text-[11px] transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {isActive ? (
                                        <>
                                            <Power className="h-4 w-4 text-orange-500/50 group-hover:text-orange-600 transition-all" />
                                            Interrupt Protocol
                                        </>
                                    ) : (
                                        <>
                                            <Power className="h-4 w-4 text-emerald-500/50 group-hover:text-emerald-600 transition-all" />
                                            Resume Protocol
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </div>
                        </TooltipTrigger>
                        {isSystem && isActive && (
                            <TooltipContent side="left" className="bg-primary border-none shadow-xl rounded-xl p-3 max-w-[180px]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground flex items-center gap-2">
                                    <ShieldAlert className="h-3 w-3" /> Core Lock
                                </p>
                                <p className="text-[9px] font-medium leading-relaxed text-primary-foreground/80 mt-1">
                                    System-defined root identities cannot be suspended to maintain environment integrity.
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenuSeparator className="bg-muted/10 my-1" />

                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full">
                                <DropdownMenuItem
                                    onClick={() => onDelete(role)}
                                    disabled={isSystem}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-destructive/5 text-destructive hover:text-destructive font-black text-[11px] transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="h-4 w-4 group-hover:scale-110 transition-all" />
                                    Purge Registry
                                    <DropdownMenuShortcut className="text-destructive/50">DEL</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </div>
                        </TooltipTrigger>
                        {isSystem && (
                            <TooltipContent side="left" className="bg-destructive border-none shadow-xl rounded-xl p-3 max-w-[180px]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-destructive-foreground flex items-center gap-2">
                                    <ShieldAlert className="h-3 w-3" /> Integrity Lock
                                </p>
                                <p className="text-[9px] font-medium leading-relaxed text-destructive-foreground/80 mt-1">
                                    This archetype is a required dependency of the engine and cannot be purged.
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
