"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api/client"
import {
    Users,
    MoreHorizontal,
    RefreshCw,
    ChevronDown,
    Activity,
    ShieldAlert,
    Ban,
    CheckCircle2,
    Search as SearchIcon
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
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-column-toggle"
import { getColumns } from "./all-users-table-columns"
import { useRouter, useParams } from "next/navigation"
import { useMemo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { GlobalUserForm } from "./global-user-form"
import { UserStats } from "./user-stats"

export function AllUsersList() {
    const [users, setUsers] = useState<any[]>([])
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    // Column and Filter states
    const [sorting, setSorting] = useState<any[]>([])
    const [columnFilters, setColumnFilters] = useState<any[]>([])
    const [columnVisibility, setColumnVisibility] = useState<any>({})
    const [rowSelection, setRowSelection] = useState({})
    // Pagination
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)

    const router = useRouter()
    const params = useParams()
    const [editingUser, setEditingUser] = useState<any>(null)
    const [refreshSignal, setRefreshSignal] = useState(0)

    const columns = useMemo(() => getColumns({
        onEdit: (user) => setEditingUser(user),
        onView: (user) => router.push(`/${params.lang}/panel/teams/${user.id}`)
    }), [router, params.lang])

    const table = useReactTable({
        data: users,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        pageCount: Math.ceil(total / limit),
        manualPagination: true,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater({ pageIndex: page - 1, pageSize: limit })
                setPage(newState.pageIndex + 1)
                setLimit(newState.pageSize)
            } else {
                setPage(updater.pageIndex + 1)
                setLimit(updater.pageSize)
            }
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Filters (Draft state via inputs)
    const [search, setSearch] = useState("")
    const [emailFilter, setEmailFilter] = useState("")
    const [firstNameFilter, setFirstNameFilter] = useState("")
    const [lastNameFilter, setLastNameFilter] = useState("")
    const [phoneFilter, setPhoneFilter] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") // all, active, revoked
    const [tenantFilter, setTenantFilter] = useState("all")

    // Stats
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, verified: 0, unverified: 0 })

    async function fetchUsers() {
        try {
            setLoading(true)

            const queryParams = new URLSearchParams()
            queryParams.append("page", page.toString())
            queryParams.append("limit", limit.toString())

            if (search) queryParams.append("username", search) // Sending to username or search based on backend
            if (emailFilter) queryParams.append("email", emailFilter)
            if (firstNameFilter) queryParams.append("firstName", firstNameFilter)
            if (lastNameFilter) queryParams.append("lastName", lastNameFilter)
            if (phoneFilter) queryParams.append("phone", phoneFilter)
            if (fromDate) queryParams.append("fromDate", fromDate)
            if (toDate) queryParams.append("toDate", toDate)
            if (statusFilter !== "all") queryParams.append("status", statusFilter)
            if (tenantFilter !== "all") queryParams.append("tenantId", tenantFilter)

            const res = await apiRequest(`/users/all?${queryParams.toString()}`)
            setUsers(res.data.users || [])
            setTotal(res.data.total || 0)
            if (res.data.stats) {
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error("Failed to fetch all users", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function fetchTenants() {
            try {
                const res = await apiRequest("/tenants")
                setTenants(res.data.tenants || [])
            } catch (error) {
                console.error("Failed to fetch tenants", error)
            }
        }
        fetchTenants()
    }, [])

    useEffect(() => {
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, refreshSignal])

    function handleApplyFilter() {
        if (page !== 1) {
            setPage(1)
        } else {
            setRefreshSignal(s => s + 1)
        }
    }

    function handleResetFilters() {
        setSearch("")
        setEmailFilter("")
        setFirstNameFilter("")
        setLastNameFilter("")
        setPhoneFilter("")
        setFromDate("")
        setToDate("")
        setStatusFilter("all")
        setTenantFilter("all")
        if (page !== 1) {
            setPage(1)
        } else {
            // Give React a tick to reset the state values
            setTimeout(() => setRefreshSignal(s => s + 1), 0)
        }
    }
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <UserStats
                total={stats.total}
                active={stats.active}
                inactive={stats.revoked}
                verified={stats.verified}
            />

            {/* Advanced Filters */}
            <div className="p-5 pb-6 rounded-2xl border border-muted/20 bg-card shadow-sm space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Username Identifier</label>
                        <Input placeholder="Filter by username" value={search} onChange={e => setSearch(e.target.value)} className="h-9 text-[11px] font-bold bg-muted/20 border-muted/30 focus:bg-background transition-all rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Digital Mail</label>
                        <Input placeholder="Filter by email" value={emailFilter} onChange={e => setEmailFilter(e.target.value)} className="h-9 text-[11px] font-bold bg-muted/20 border-muted/30 focus:bg-background transition-all rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Registry Name</label>
                        <Input placeholder="First designation" value={firstNameFilter} onChange={e => setFirstNameFilter(e.target.value)} className="h-9 text-[11px] font-bold bg-muted/20 border-muted/30 focus:bg-background transition-all rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Family Designation</label>
                        <Input placeholder="Last designation" value={lastNameFilter} onChange={e => setLastNameFilter(e.target.value)} className="h-9 text-[11px] font-bold bg-muted/20 border-muted/30 focus:bg-background transition-all rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Environment Node</label>
                        <div className="relative">
                            <select
                                value={tenantFilter}
                                onChange={e => setTenantFilter(e.target.value)}
                                className="w-full h-9 px-3 text-[11px] font-bold bg-muted/20 border border-muted/30 focus:bg-background transition-all rounded-lg appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary/20 hover:bg-background"
                            >
                                <option value="all">Global Workspace</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-foreground/50 uppercase tracking-widest ml-1">Security State</label>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full h-9 px-3 text-[11px] font-bold bg-muted/20 border border-muted/30 focus:bg-background transition-all rounded-lg appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary/20 hover:bg-background"
                            >
                                <option value="all">Any Security State</option>
                                <option value="active">Operational</option>
                                <option value="revoked">Revoked / Suspended</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-end justify-end gap-2 xl:col-span-2 pt-2 xl:pt-0">
                        <Button
                            onClick={handleResetFilters}
                            disabled={loading}
                            variant="outline"
                            className="h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 border-muted/30 hover:bg-muted/30 transition-all opacity-60 hover:opacity-100"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Purge
                        </Button>
                        <Button
                            onClick={handleApplyFilter}
                            disabled={loading}
                            className="bg-foreground text-background hover:bg-foreground/90 h-9 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all active:scale-95"
                        >
                            {loading ? <Activity className="h-3 w-3 animate-spin" /> : <SearchIcon className="h-3 w-3" />}
                            Sync Filter
                        </Button>
                    </div>
                </div>
                {/* Extracted the Toolbar view options logic inline */}
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-muted/20">
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            {/* Dynamic Table Layout with Pagination */}
            <div className="rounded-2xl border border-muted/20 bg-card shadow-sm flex flex-col relative overflow-hidden group">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <Activity className="h-6 w-6 text-primary animate-spin" />
                    </div>
                )}

                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/10 border-b border-muted/20">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent h-12">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-xs font-bold text-foreground">
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
                                        className="hover:bg-muted/[0.05] border-b border-muted/10 transition-colors group/row h-[60px]"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
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
                                    <TableCell colSpan={columns.length} className="h-[300px] text-center">
                                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                            <div className="h-12 w-12 rounded-full bg-muted/10 flex items-center justify-center mb-3">
                                                <SearchIcon className="h-5 w-5 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-sm font-bold text-foreground mb-1">No users found</p>
                                            <p className="text-xs text-muted-foreground">Adjust your filters to see more results.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Action Bar when rows selected */}
                {Object.keys(rowSelection).length > 0 && (
                    <div className="sticky bottom-6 left-1/2 -translate-x-1/2 bg-popover/80 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2 w-max animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-4 hidden">
                    </div>
                )}

                {/* Edit User Dialog */}
                <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-background border-muted/20 gap-0 rounded-2xl">
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                            {/* Left Sidebar Context */}
                            <div className="hidden md:flex flex-col w-[320px] bg-muted/10 border-r border-muted/20 p-8 pt-10 relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                                <div className="mb-8">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-5 relative z-10 shadow-sm">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground relative z-10">Edit Profile</DialogTitle>
                                    <DialogHeader className="p-0 text-left space-y-0 mt-2">
                                        <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                                            Modify the properties and regional assignments for {editingUser?.firstName} {editingUser?.lastName}.
                                        </p>
                                    </DialogHeader>
                                </div>

                                <div className="mt-auto relative z-10 space-y-4">
                                    <div className="p-4 rounded-xl bg-background border shadow-sm border-muted/20">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Access Protocol</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            All edits sync immediately. To temporarily prevent login, use Suspend rather than unassigning roles.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content Area */}
                            <div className="flex-1 p-6 md:p-8 bg-background relative overflow-y-auto">
                                {editingUser && (
                                    <GlobalUserForm
                                        editData={editingUser}
                                        onSuccess={() => {
                                            setEditingUser(null)
                                            setRefreshSignal(s => s + 1)
                                        }}
                                        onCancel={() => setEditingUser(null)}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-muted/20 bg-muted/5">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    )
}
