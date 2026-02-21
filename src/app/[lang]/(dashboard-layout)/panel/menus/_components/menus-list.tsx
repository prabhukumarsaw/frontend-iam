"use client"

import { useEffect, useState, useMemo } from "react"
import { apiRequest } from "@/lib/api/client"
import {
    Activity,
    RefreshCw,
    Search as SearchIcon,
    LayoutTemplate,
    Network,
    Link as LinkIcon,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination"
import { getColumns } from "./menus-table-columns"
import { StatsDeck, StatItem } from "@/components/layout/stats-deck"
import { MenuForm } from "./menu-form"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function MenusList() {
    const { toast } = useToast()
    const [menus, setMenus] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editMenu, setEditMenu] = useState<any>(null)

    // Table state
    const [sorting, setSorting] = useState<any[]>([])
    const [columnFilters, setColumnFilters] = useState<any[]>([])
    const [columnVisibility, setColumnVisibility] = useState<any>({})
    const [rowSelection, setRowSelection] = useState({})

    // Filters
    const [search, setSearch] = useState("")

    async function fetchMenus() {
        try {
            setLoading(true)
            const res = await apiRequest("/menus")
            setMenus(res.data?.menus || [])
        } catch (error) {
            console.error("Failed to fetch menus", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMenus()
    }, [])

    function handleEdit(menu: any) {
        setEditMenu(menu)
        setIsEditOpen(true)
    }

    async function handleDelete(menu: any) {
        if (!window.confirm("Confirm destruction of this integration node? Children will be deleted.")) return
        try {
            setLoading(true)
            await apiRequest(`/menus/${menu.id}`, { method: "DELETE" })
            toast({
                title: "Node Eradicated",
                description: "The navigation structural node was successfully removed.",
            })
            fetchMenus()
        } catch (error) {
            toast({
                title: "Operation Incomplete",
                description: "Failed to remove the node.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Build hierarchical tree
    const treeData = useMemo(() => {
        const buildTree = (menusList: any[], parentId: string | null = null): any[] => {
            return menusList
                .filter(m => m.parentId === parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(m => ({
                    ...m,
                    subRows: buildTree(menusList, m.id)
                }))
        }
        return buildTree(menus)
    }, [menus])

    // KPI Calculation
    const stats: StatItem[] = [
        {
            title: "Total Nodes",
            value: menus.length,
            icon: LayoutTemplate,
            color: "primary",
            description: "Registered menu blocks"
        },
        {
            title: "Nested Networks",
            value: menus.filter(m => m.parentId).length,
            icon: Network,
            color: "emerald-500",
            description: "Child structural items",
            suffix: "Child"
        },
        {
            title: "Secured Nodes",
            value: menus.filter(m => m.permissionCode).length,
            icon: Shield,
            color: "blue-500",
            description: "Permission bound"
        },
        {
            title: "Active Links",
            value: menus.filter(m => m.path).length,
            icon: LinkIcon,
            color: "orange-500",
            description: "Routable navigation"
        }
    ]

    const table = useReactTable({
        data: treeData,
        columns: getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getSubRows: row => row.subRows,
    })

    function handleResetFilters() {
        table.resetColumnFilters()
        setSearch("")
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-muted/20 p-8 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)]">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <LayoutTemplate className="h-6 w-6 text-primary" />
                            Reconfigure Link Protocol
                        </DialogTitle>
                    </DialogHeader>
                    {editMenu && (
                        <MenuForm
                            editData={editMenu}
                            onSuccess={() => {
                                setIsEditOpen(false)
                                fetchMenus()
                            }}
                            onCancel={() => setIsEditOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <StatsDeck stats={stats} />

            <div className="p-5 pb-6 rounded-2xl border border-muted/20 bg-card shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="space-y-1 w-full max-w-sm">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Search Topology</label>
                        <div className="relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                                placeholder="E.g. Settings, Dashboard..."
                                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                                onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                                className="h-10 pl-10 text-[11px] font-bold bg-muted/20 border-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-3 shrink-0">
                        <Button
                            onClick={handleResetFilters}
                            disabled={loading || table.getState().columnFilters.length === 0}
                            variant="outline"
                            className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 flex-1 sm:flex-initial border-muted/30 hover:bg-muted/30 transition-all opacity-60 hover:opacity-100"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Reset
                        </Button>
                        <Button
                            onClick={fetchMenus}
                            disabled={loading}
                            className="bg-foreground text-background hover:bg-foreground/90 h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2.5 shadow-lg flex-1 sm:flex-initial transition-all active:scale-95 group"
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4 group-hover:text-primary transition-colors" />}
                            Synchronize
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-muted/20 bg-card shadow-sm flex flex-col relative overflow-hidden group">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[1.4rem]">
                        <Activity className="h-6 w-6 text-primary animate-spin" />
                    </div>
                )}

                <div className="w-full overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-muted/20 bg-muted/5">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="h-12 text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60 shrink-0 whitespace-nowrap px-6 bg-transparent border-r border-transparent last:border-r-0 first:rounded-tl-2xl last:rounded-tr-2xl">
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
                                        className="hover:bg-muted/10 border-b border-muted/10 transition-colors duration-200"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 py-3 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-40 text-center text-[11px] font-black text-muted-foreground uppercase tracking-widest bg-muted/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.05)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
                                        <LayoutTemplate className="h-8 w-8 mx-auto mb-3 opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                                        Zero active node topologies discovered.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="border-t border-muted/20 bg-muted/5 p-4 rounded-b-[1.4rem]">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    )
}
