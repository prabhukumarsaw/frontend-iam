"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import {
    UserCircle,
    MoreHorizontal,
    Eye,
    Settings2,
    UserMinus,
    CheckCircle2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { getAbsoluteUrl } from "@/lib/api/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

export const getColumns = ({ onEdit, onView }: { onEdit: (user: any) => void, onView: (user: any) => void }): ColumnDef<any>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                className="ms-2"
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="ms-2"
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-full border border-muted/20 shadow-sm shrink-0">
                        <AvatarImage src={getAbsoluteUrl(user.avatar)} className="object-cover" />
                        <AvatarFallback className="text-[10px] font-bold bg-muted/40 text-foreground uppercase tracking-tight">
                            {user.firstName ? (
                                <>{user.firstName[0]}{user.lastName?.[0]}</>
                            ) : (
                                <UserCircle className="h-4 w-4 opacity-40 text-muted-foreground" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold tracking-tight text-foreground">
                            {user.firstName || user.username} {user.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate opacity-80">
                            {user.tenant?.name || "No tenant"}
                        </span>
                    </div>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => {
            return <span className="text-sm text-foreground/80">{row.original.email}</span>
        },
        enableSorting: true,
    },
    {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => {
            return <span className="text-sm text-foreground/80">{row.original.phone || "-"}</span>
        },
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    {isActive ? (
                        <Badge variant="outline" className="h-6 px-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold tracking-wider">
                            Verified
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="h-6 px-2 bg-slate-500/10 text-slate-500 border-slate-500/20 text-[10px] font-bold tracking-wider">
                            Revoked
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined Date" />,
        cell: ({ row }) => {
            return <span className="text-sm text-foreground/80">{format(new Date(row.original.createdAt), "M/dd/yyyy")}</span>
        },
        enableSorting: true,
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center justify-end gap-2 text-muted-foreground group-hover/row:text-muted-foreground transition-all">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(user)}
                        className="h-7 w-7 rounded border border-transparent hover:border-muted-foreground/20 hover:bg-muted/50 transition-all text-xs font-semibold gap-1 px-2 w-auto"
                    >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline">View</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-muted/50 hover:bg-muted transition-colors opacity-100 sm:opacity-0 group-hover/row:opacity-100">
                                <MoreHorizontal className="h-3.5 w-3.5 text-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-muted/20 shadow-xl p-1.5">
                            <DropdownMenuItem onClick={() => onEdit(user)} className="text-xs font-semibold gap-2 rounded-lg py-2">
                                <Settings2 className="h-3.5 w-3.5" /> Edit Profile
                            </DropdownMenuItem>
                            {user.isActive ? (
                                <DropdownMenuItem className="text-xs font-semibold text-destructive focus:text-destructive gap-2 rounded-lg py-2">
                                    <UserMinus className="h-3.5 w-3.5" /> Suspend
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="text-xs font-semibold text-emerald-600 focus:text-emerald-600 gap-2 rounded-lg py-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Reactivate
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }
]
