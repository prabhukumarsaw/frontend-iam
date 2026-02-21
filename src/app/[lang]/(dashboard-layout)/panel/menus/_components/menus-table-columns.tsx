"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import {
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle2,
    Ban,
    Link as LinkIcon,
    Shield,
    Network,
    ChevronRight,
    ChevronDown,
    LayoutTemplate
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DynamicIcon } from "@/components/dynamic-icon"

export const getColumns = ({
    onEdit,
    onDelete,
    onToggleStatus,
}: {
    onEdit: (menu: any) => void,
    onDelete: (menu: any) => void,
    onToggleStatus: (menu: any) => void,
}): ColumnDef<any>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Node Hierarchy" />,
            cell: ({ row }) => {
                const menu = row.original;

                return (
                    <div
                        className="flex items-center gap-3"
                        style={{ paddingLeft: `${row.depth * 2}rem` }}
                    >
                        {row.getCanExpand() && (
                            <button
                                onClick={row.getToggleExpandedHandler()}
                                className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground hover:bg-muted rounded transition-colors"
                            >
                                {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        )}
                        {!row.getCanExpand() && <div className="w-5 shrink-0" />}

                        <div className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all duration-300",
                            menu.parentId
                                ? "bg-muted/30 border-muted/20 text-muted-foreground"
                                : "bg-primary/10 border-primary/20 text-primary shadow-primary/5"
                        )}>
                            <DynamicIcon name={menu.icon || (menu.parentId ? "Link" : "Network")} className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={cn(
                                "text-[13px] font-bold tracking-tight truncate block transition-colors",
                                menu.isActive ? "text-foreground" : "text-muted-foreground line-through opacity-60"
                            )}>
                                {menu.title}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                                    {menu.parentId ? "Child Node" : "Root Group"}
                                </span>
                                {!menu.isActive && (
                                    <Badge variant="outline" className="h-3.5 px-1.5 text-[7px] font-black uppercase tracking-[0.1em] border-slate-500/30 text-slate-500 bg-slate-500/5 py-0">
                                        Suspended
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "path",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Routing Protocol" />,
            cell: ({ row }) => {
                const path = row.original.path;
                return path ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 px-2.5 text-[10px] font-mono border-muted/30 text-muted-foreground bg-muted/5 flex items-center gap-1.5 lowercase shadow-sm">
                            <LinkIcon className="h-3 w-3 opacity-40" /> {path}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-[10px] italic font-semibold text-muted-foreground/30 px-2.5">Abstract Node</span>
                )
            },
        },
        {
            id: "module",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Domain Module" />,
            cell: ({ row }) => {
                const module = row.original.module;
                return module ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-6 px-2.5 text-[9px] uppercase font-black tracking-[0.12em] border-none bg-primary/5 text-primary/80 flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                            <LayoutTemplate className="h-3 w-3" /> {module.name}
                        </Badge>
                    </div>
                ) : (
                    <Badge variant="outline" className="h-6 px-2.5 text-[9px] uppercase font-black tracking-[0.1em] border-dotted border-muted/20 text-muted-foreground/30 italic bg-transparent">
                        Global Scope
                    </Badge>
                )
            },
        },
        {
            accessorKey: "permissionCode",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Security Gate" />,
            cell: ({ row }) => {
                const permissionCode = row.original.permissionCode;
                return permissionCode ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-6 px-2.5 text-[9px] uppercase font-black tracking-[0.12em] border-none bg-orange-500/10 text-orange-600 flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                            <Shield className="h-3 w-3" /> {permissionCode}
                        </Badge>
                    </div>
                ) : (
                    <Badge variant="outline" className="h-6 px-2.5 text-[9px] uppercase font-black tracking-[0.1em] border-dashed border-muted/30 text-muted-foreground/40 italic bg-transparent">
                        Public Access
                    </Badge>
                )
            },
        },
        {
            accessorKey: "order",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Render Priority" />,
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/20 border border-muted/10">
                        <span className="text-[11px] font-black font-mono text-muted-foreground tabular-nums">
                            {row.original.order || 0}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                return (
                    <div className="flex items-center gap-3">
                        {isActive ? (
                            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.2)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-500/20 opacity-70">
                                <Ban className="h-3 w-3" /> Suspended
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const menu = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted/80 rounded-xl transition-all active:scale-90">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4.5 w-4.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px] p-2 bg-background/95 backdrop-blur-xl border-muted/20 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                            <div className="px-3 py-2 mb-1.5">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Node Operations</p>
                            </div>
                            <DropdownMenuItem
                                onClick={() => onEdit(menu)}
                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-muted font-bold text-[11px] transition-all group"
                            >
                                <Edit className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" /> Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onToggleStatus(menu)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold text-[11px] transition-all group",
                                    menu.isActive ? "hover:bg-slate-500/10 text-slate-600" : "hover:bg-emerald-500/10 text-emerald-600"
                                )}
                            >
                                {menu.isActive ? (
                                    <>
                                        <Ban className="h-4 w-4 text-slate-500 group-hover:rotate-12 transition-transform" /> Suspend Protocol
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" /> Reactivate Node
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted/40 my-1.5" />
                            <DropdownMenuItem
                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-destructive/10 text-destructive font-black text-[11px] transition-all group"
                                onClick={() => onDelete(menu)}
                            >
                                <Trash2 className="h-4 w-4 group-hover:scale-110 group-hover:rotate-6 transition-transform text-red-500" /> Eviscerate Node
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
