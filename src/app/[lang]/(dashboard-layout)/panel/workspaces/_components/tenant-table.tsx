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
import { Globe, Layout } from "lucide-react"

import { TenantTableToolbar } from "./tenant-table-toolbar"
import { TenantTableRowActions } from "./tenant-table-row-actions"

interface TenantTableProps {
    data: any[]
    onEdit: (tenant: any) => void
}

export function TenantTable({ data, onEdit }: TenantTableProps) {
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
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Workspace" />
                ),
                cell: ({ row }) => {
                    const name = row.getValue("name") as string
                    const id = row.original.id as string
                    return (
                        <div className="flex items-center gap-3 py-1">
                            <div className="h-9 w-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-[12px] font-bold text-primary shrink-0 shadow-sm">
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate font-semibold text-sm text-foreground">
                                    {name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                    <span className="opacity-50">ID:</span> {id.split('-')[0]}
                                </span>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "slug",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Namespace" />
                ),
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center">
                            <Badge variant="secondary" className="bg-muted/50 hover:bg-muted font-mono text-[10px] px-1.5 py-0 h-5 border-none text-muted-foreground">
                                {row.getValue("slug")}
                            </Badge>
                        </div>
                    )
                },
            },
            {
                accessorKey: "domain",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Endpoint" />
                ),
                cell: ({ row }) => {
                    const domain = row.getValue("domain") as string
                    return (
                        <div className="flex items-center gap-2 group cursor-default">
                            <div className="p-1 rounded bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                                <Globe className="h-3 w-3 text-blue-500/70" />
                            </div>
                            <span className="text-xs text-muted-foreground truncate">{domain || "local.internal"}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "isActive",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => {
                    const isActive = row.getValue("isActive")
                    return (
                        <Badge
                            variant="outline"
                            className={cn(
                                "rounded-full pl-1.5 pr-2.5 py-0 h-6 text-[10px] font-semibold border-none ring-1 ring-inset",
                                isActive
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                    : "bg-amber-50 text-amber-700 ring-amber-600/20"
                            )}
                        >
                            <div className={cn("mr-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.1)]", isActive ? "bg-emerald-500" : "bg-amber-500")} />
                            {isActive ? "Operational" : "Maintenance"}
                        </Badge>
                    )
                },
                filterFn: (row, id, value) => {
                    return value === row.getValue(id)
                },
            },
            {
                id: "actions",
                cell: ({ row }) => <TenantTableRowActions row={row} onEdit={onEdit} />,
            },
        ],
        [onEdit]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
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
        <div className="space-y-4">
            <TenantTableToolbar table={table} />
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 text-xs font-medium px-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-b last:border-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2.5 px-4 h-14">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Layout className="h-8 w-8 opacity-20" />
                                        <p className="text-sm font-medium">No results found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

