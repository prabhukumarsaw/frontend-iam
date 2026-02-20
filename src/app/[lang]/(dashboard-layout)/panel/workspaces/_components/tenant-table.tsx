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
    onView: (tenant: any) => void
}

export function TenantTable({ data, onEdit, onView }: TenantTableProps) {
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
                    <DataTableColumnHeader column={column} title="Workspace Name" />
                ),
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground mr-1">
                                {String(row.getValue("name")).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="max-w-[300px] truncate font-medium text-sm">
                                    {row.getValue("name")}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {row.original.id.split('-')[0]}
                                </span>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "slug",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Slug" />
                ),
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center w-[120px]">
                            <code className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                /{row.getValue("slug")}
                            </code>
                        </div>
                    )
                },
            },
            {
                accessorKey: "domain",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Domain" />
                ),
                cell: ({ row }) => {
                    const domain = row.getValue("domain") as string
                    return (
                        <div className="flex items-center gap-1.5 opacity-80">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{domain || "local.internal"}</span>
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
                                "rounded-full px-2 py-0 text-[10px] font-medium border-0",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-amber-500/10 text-amber-600"
                            )}
                        >
                            <div className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-amber-500")} />
                            {isActive ? "Operational" : "Standby"}
                        </Badge>
                    )
                },
                filterFn: (row, id, value) => {
                    return value === row.getValue(id)
                },
            },
            {
                id: "actions",
                cell: ({ row }) => <TenantTableRowActions row={row} onEdit={onEdit} onView={onView} />,
            },
        ],
        [onEdit, onView]
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

