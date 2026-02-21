"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Shield,
    Users,
    ShieldAlert,
    Ban,
    CheckCircle2,
    Database,
    Package
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const getColumns = ({
    onEdit,
    onDelete,
    onToggleStatus
}: {
    onEdit: (role: any) => void,
    onDelete: (role: any) => void,
    onToggleStatus: (role: any) => void
}): ColumnDef<any>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm transition-colors",
                            role.isSystem
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-muted/40 border-muted/20 text-foreground"
                        )}>
                            {role.isSystem ? <Database className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold tracking-tight text-foreground truncate block">
                                {role.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5 opacity-80">
                                {role.code}
                                {role.isSystem && (
                                    <Badge variant="secondary" className="h-3.5 px-1 text-[8px] bg-primary/20 text-primary border-none font-black uppercase">System</Badge>
                                )}
                            </span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Scope & Permissions" />,
            cell: ({ row }) => {
                const role = row.original;
                const permissionCount = role.rolePermissions?.length || 0;
                const menuCount = role.roleMenus?.length || 0;

                return (
                    <div className="flex flex-col gap-2 py-1 max-w-[240px]">
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                            {role.description || "Defined operational role for workspace management."}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-bold border-muted/30 text-muted-foreground bg-muted/5 flex items-center gap-1">
                                <ShieldAlert className="h-2.5 w-2.5" /> {permissionCount} Permissions
                            </Badge>
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-bold border-muted/30 text-muted-foreground bg-muted/5 flex items-center gap-1">
                                <Package className="h-2.5 w-2.5" /> {menuCount} Menus
                            </Badge>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "stats",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
            cell: ({ row }) => {
                const role = row.original;
                const userCount = role._count?.userRoles || 0;

                return (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                            <Users className="h-3 w-3 text-slate-500" />
                            <span className="text-[11px] font-bold text-slate-500">{userCount}</span>
                        </div>
                    </div>
                )
            }
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
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Deployed On" />,
            cell: ({ row }) => {
                return (
                    <div className="text-[11px] font-medium text-muted-foreground">
                        {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const role = row.original

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
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role Protocol</p>
                            </div>
                            <DropdownMenuItem
                                onClick={() => onEdit(role)}
                                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted font-medium text-xs transition-colors"
                            >
                                <Edit className="h-3.5 w-3.5 text-blue-500" /> Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onToggleStatus(role)}
                                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted font-medium text-xs transition-colors"
                                disabled={role.isSystem && role.isActive}
                            >
                                {role.isActive ? (
                                    <><Ban className="h-3.5 w-3.5 text-slate-500" /> Suspend Protocol</>
                                ) : (
                                    <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Activate Protocol</>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted/40 my-1" />
                            <DropdownMenuItem
                                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive font-medium text-xs transition-colors group"
                                onClick={() => onDelete(role)}
                                disabled={role.isSystem}
                            >
                                <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Delete Permanently
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
