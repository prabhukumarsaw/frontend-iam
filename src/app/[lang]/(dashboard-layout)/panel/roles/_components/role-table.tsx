"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination"
import { cn } from "@/lib/utils"
import {
    Shield,
    Database,
    ShieldAlert,
    Package,
    Users,
    CheckCircle2,
    Ban,
    Activity,
    Layers
} from "lucide-react"
import { format } from "date-fns"

import { RoleTableToolbar } from "./role-table-toolbar"
import { RoleTableRowActions } from "./role-table-row-actions"

interface RoleTableProps {
    data: any[]
    total: number
    page: number
    limit: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    search: string
    onSearchChange: (search: string) => void
    onRefresh: () => void
    onEdit: (role: any) => void
    onDelete: (role: any) => void
    onToggleStatus: (role: any) => void
    isLoading?: boolean
}

export function RoleTable({
    data,
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    search,
    onSearchChange,
    onRefresh,
    onEdit,
    onDelete,
    onToggleStatus,
    isLoading
}: RoleTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const columns = React.useMemo<ColumnDef<any>[]>(
        () => [
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
                header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
                cell: ({ row }) => {
                    const role = row.original;
                    return (
                        <div className="flex items-center gap-3.5 group/cell cursor-default">
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm transition-all duration-300 group-hover/cell:scale-110",
                                role.isSystem
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : "bg-muted/40 border-muted/20 text-foreground"
                            )}>
                                {role.isSystem ? <Database className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold tracking-tight text-foreground truncate block leading-tight">
                                    {role.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter uppercase font-black">
                                        {role.code}
                                    </span>
                                    {role.isSystem && (
                                        <Badge variant="secondary" className="h-3.5 px-1 text-[8px] bg-primary/20 text-primary border-none font-black uppercase tracking-widest">
                                            Core
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "description",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Policy Scope" />,
                cell: ({ row }) => {
                    const role = row.original;
                    const permissionCount = role.rolePermissions?.length || 0;
                    const menuCount = role.roleMenus?.length || 0;

                    return (
                        <div className="flex flex-col gap-2 py-1 max-w-[280px]">
                            <p className="text-[11px] text-muted-foreground line-clamp-1 italic font-medium leading-relaxed opacity-80">
                                {role.description || "Defined operational role for workspace management."}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/40 bg-muted/20 px-1.5 py-0.5 rounded border border-muted/30">
                                    <ShieldAlert className="h-2.5 w-2.5" /> {permissionCount} perms
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/40 bg-muted/20 px-1.5 py-0.5 rounded border border-muted/30">
                                    <Package className="h-2.5 w-2.5" /> {menuCount} menus
                                </span>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "stats",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Active Deployment" />,
                cell: ({ row }) => {
                    const role = row.original;
                    const userCount = role._count?.userRoles || 0;

                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 shadow-sm transition-all hover:bg-blue-500/10 hover:scale-105">
                                <Users className="h-3.5 w-3.5 text-blue-500/70" />
                                <span className="text-xs font-black text-blue-500/80 tabular-nums">{userCount}</span>
                                <span className="text-[9px] font-bold text-blue-500/40 uppercase tracking-tighter">users</span>
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "isActive",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Security State" />,
                cell: ({ row }) => {
                    const isActive = row.getValue("isActive") as boolean
                    return (
                        <div className="flex items-center">
                            {isActive ? (
                                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-emerald-500/[0.03] ring-1 ring-emerald-500/20 text-emerald-600 shadow-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Operational</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-500/[0.03] ring-1 ring-slate-500/20 text-slate-500 shadow-sm opacity-60">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Suspended</span>
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-foreground opacity-80">
                                {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter opacity-50">Deployed</span>
                        </div>
                    )
                },
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <RoleTableRowActions
                        row={row}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                    />
                ),
            },
        ],
        [onEdit, onDelete, onToggleStatus]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
        },
        pageCount: Math.ceil(total / limit),
        manualPagination: true,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater({ pageIndex: page - 1, pageSize: limit })
                onPageChange(newState.pageIndex + 1)
                onLimitChange(newState.pageSize)
            }
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="space-y-6">
            <RoleTableToolbar
                table={table}
                search={search}
                onSearchChange={onSearchChange}
                onRefresh={onRefresh}
                isLoading={isLoading}
            />

            <div className="rounded-2xl border border-muted/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col relative overflow-hidden group">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl animate-in fade-in duration-500">
                        <div className="flex flex-col items-center gap-4">
                            <Activity className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Syncing Registry</p>
                        </div>
                    </div>
                )}

                <div className="w-full overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-muted/5 border-b border-muted/10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent h-12">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-6 border-r border-muted/5 last:border-r-0">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-primary/[0.02] border-b border-muted/5 transition-all duration-300 group/row h-[60px]"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 border-r border-muted/[0.02] last:border-r-0">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-700">
                                            <div className="h-20 w-20 rounded-[2rem] bg-muted/10 flex items-center justify-center mb-6 border border-muted/20 shadow-inner group/empty">
                                                <Layers className="h-8 w-8 text-muted-foreground/30 group-hover/empty:scale-110 transition-transform duration-500" />
                                            </div>
                                            <h3 className="text-lg font-black tracking-tight text-foreground mb-1">Policy Registry Empty</h3>
                                            <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed mx-auto font-medium opacity-70">
                                                No security roles matched your current filter criteria. Try broadening your technical search.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="px-6 py-4 border-t border-muted/10 bg-muted/[0.03]">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    )
}
