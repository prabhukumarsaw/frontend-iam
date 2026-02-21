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

export const getColumns = ({
    onEdit,
    onDelete,
}: {
    onEdit: (menu: any) => void,
    onDelete: (menu: any) => void,
}): ColumnDef<any>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Node Hierarchy" />,
            cell: ({ row }) => {
                const menu = row.original;
                const IconComp = menu.icon ? LayoutTemplate : (menu.parentId ? LinkIcon : Network);

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
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm transition-colors",
                            menu.parentId
                                ? "bg-muted/30 border-muted/20 text-muted-foreground"
                                : "bg-primary/10 border-primary/20 text-primary"
                        )}>
                            <IconComp className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold tracking-tight text-foreground truncate block">
                                {menu.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5 opacity-80">
                                {menu.parentId ? "Child Link" : "Root Group"}
                            </span>
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
                        <Badge variant="outline" className="h-5 px-2 text-[10px] font-mono border-muted/30 text-muted-foreground bg-muted/5 flex items-center gap-1.5 lowercase">
                            <LinkIcon className="h-3 w-3 opacity-50" /> {path}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-[10px] italic font-medium text-muted-foreground/50">Abstract Node</span>
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
                        <Badge variant="secondary" className="h-5 px-2 text-[9px] uppercase font-black tracking-[0.1em] border-none bg-orange-500/10 text-orange-500 flex items-center gap-1.5 shadow-inner">
                            <Shield className="h-3 w-3" /> {permissionCode}
                        </Badge>
                    </div>
                ) : (
                    <Badge variant="outline" className="h-5 px-2 text-[9px] uppercase font-black tracking-[0.1em] border-dashed border-muted/30 text-muted-foreground/50 italic bg-transparent">
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
                    <Badge variant="outline" className="h-5 w-8 flex items-center justify-center text-[10px] p-0 font-mono border-muted/30 text-muted-foreground bg-muted/5 tabular-nums">
                        {row.original.order || 0}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                return (
                    <div className="flex items-center gap-2">
                        {isActive ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-500/20 shadow-sm">
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
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/60 transition-colors">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] p-2 bg-background border-muted/20 shadow-xl rounded-xl">
                            <div className="px-2 py-1.5 mb-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Node Actions</p>
                            </div>
                            <DropdownMenuItem
                                onClick={() => onEdit(menu)}
                                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted font-medium text-xs transition-colors"
                            >
                                <Edit className="h-3.5 w-3.5 text-blue-500" /> Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted/40 my-1" />
                            <DropdownMenuItem
                                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive font-medium text-xs transition-colors group"
                                onClick={() => onDelete(menu)}
                            >
                                <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Delete Node
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
