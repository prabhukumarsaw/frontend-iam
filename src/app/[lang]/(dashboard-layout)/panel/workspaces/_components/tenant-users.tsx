"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api/client"
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    MoreHorizontal,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    UserCircle,
    BadgeCheck,
    Eye,
    Settings2,
    UserMinus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { UserForm } from "./user-form"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TenantUsersProps {
    tenantId: string
}

export function TenantUsers({ tenantId }: TenantUsersProps) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)

    async function fetchUsers() {
        try {
            setLoading(true)
            const res = await apiRequest("/users", { tenantId })
            setUsers(res.data.users || [])
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (tenantId) {
            fetchUsers()
        }
    }, [tenantId])

    function handleSuccess() {
        setIsAddUserOpen(false)
        fetchUsers()
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-4">
                    <div className="h-9 w-64 bg-muted/40 animate-pulse rounded-lg" />
                    <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-lg" />
                </div>
                <div className="border border-muted/20 rounded-xl overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 border-b last:border-0 p-4 flex items-center gap-4">
                            <div className="h-9 w-9 rounded-full bg-muted/40 animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-1/4 bg-muted/40 animate-pulse rounded-md" />
                                <div className="h-3 w-1/3 bg-muted/20 animate-pulse rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Filter by identity or email..."
                        className="pl-9 h-9 text-xs bg-muted/10 border-muted/20 focus:bg-background transition-all rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-[11px] font-bold uppercase tracking-tight gap-1.5 border-muted/20 hover:bg-muted/50">
                        <Filter className="h-3.5 w-3.5" />
                        Criteria
                    </Button>
                    <Button
                        onClick={() => setIsAddUserOpen(true)}
                        className="h-9 px-4 text-[11px] font-bold uppercase tracking-tight gap-2 shadow-sm shadow-primary/10 transition-all hover:bg-primary/90 active:scale-95 rounded-lg"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Provision Member
                    </Button>
                </div>
            </div>

            {/* Creation Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-5xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-card">
                    <div className="grid grid-cols-1 lg:grid-cols-7 h-full">
                        {/* Left Sidebar Detail */}
                        <div className="hidden lg:flex lg:col-span-2 bg-primary/[0.03] border-r border-primary/5 p-8 flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                            <div className="space-y-6 relative z-10">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <UserPlus className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] h-5 font-bold tracking-widest px-2">SYSTEM NODE</Badge>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Identity Protocol</h2>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                        Initializing a new cryptographically unique identity profile for this localized workspace environment.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    <Shield className="h-3 w-3 text-primary" />
                                    <span>Security Standards</span>
                                </div>
                                <div className="space-y-2">
                                    {["Encrypted at rest", "MFA Mandatory", "Role-based Access"].map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/80">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Content Form */}
                        <div className="col-span-1 lg:col-span-5 flex flex-col max-h-[85vh]">
                            <div className="p-6 pb-2">
                                <DialogHeader className="gap-1">
                                    <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                                        Provision Identity
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-[10px] font-medium uppercase tracking-tight">
                                        Complete the environmental onboarding process to authorize access.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                            <div className="px-6 pb-6 pt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <UserForm
                                    tenantId={tenantId}
                                    onSuccess={handleSuccess}
                                    onCancel={() => setIsAddUserOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Main Table */}
            <div className="rounded-xl border border-muted/20 bg-card shadow-sm overflow-hidden">
                <ScrollArea className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-b border-muted/10 h-10">
                                <TableHead className="w-[280px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 pl-6">Profile & Identity</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Access Tiers</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Security Baseline</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Provisioned</TableHead>
                                <TableHead className="w-[60px] pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/[0.05] border-b border-muted/10 last:border-0 transition-all duration-200 group">
                                        <TableCell className="py-3 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-200">
                                                    {user.firstName ? (
                                                        <span className="text-xs font-bold text-primary tracking-tighter">
                                                            {user.firstName[0]}{user.lastName?.[0]}
                                                        </span>
                                                    ) : (
                                                        <UserCircle className="h-5 w-5 text-primary/70" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-sm font-bold truncate tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                        {user.firstName} {user.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1.5 opacity-80">
                                                        <Mail className="h-2.5 w-2.5 opacity-60" /> {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {user.userRoles?.length > 0 ? (
                                                    user.userRoles.map((ur: any) => (
                                                        <Badge
                                                            key={ur.roleId}
                                                            variant="outline"
                                                            className="text-[9px] h-4.5 py-0 px-1.5 font-black uppercase tracking-tight bg-primary/[0.03] text-primary/80 border-primary/10 hover:bg-primary/5 transition-colors"
                                                        >
                                                            {ur.role.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase bg-muted/20 text-muted-foreground/50 border-transparent">
                                                        Zero Access
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.isActive ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/10">
                                                        <XCircle className="h-2.5 w-2.5 opacity-50" />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">Revoked</span>
                                                    </div>
                                                )}
                                                {user.mfaEnabled && (
                                                    <div className="bg-primary/10 p-0.5 rounded-md border border-primary/20 tooltip-trigger" title="MFA Protected">
                                                        <BadgeCheck className="h-3 w-3 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] text-muted-foreground font-bold tracking-tight opacity-70">
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg group-hover:bg-muted transition-colors">
                                                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[190px] p-1.5 rounded-xl border-muted/20 shadow-xl">
                                                    <DropdownMenuLabel className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5">Administrative Control</DropdownMenuLabel>
                                                    <DropdownMenuItem className="text-xs font-bold gap-2 focus:bg-primary/5 rounded-lg py-2">
                                                        <Eye className="h-3.5 w-3.5 text-primary" />
                                                        Profile Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-bold gap-2 focus:bg-primary/5 rounded-lg py-2">
                                                        <Settings2 className="h-3.5 w-3.5 text-primary" />
                                                        Manage Authority
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-muted/50 my-1.5" />
                                                    <DropdownMenuItem className="text-xs font-bold text-destructive focus:text-destructive focus:bg-destructive/[0.03] gap-2 rounded-lg py-2">
                                                        <UserMinus className="h-3.5 w-3.5" />
                                                        Revoke Identity
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                            <div className="h-16 w-16 rounded-full bg-muted/10 flex items-center justify-center mb-4 relative">
                                                <Users className="h-8 w-8 text-muted-foreground/20" />
                                                <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20" />
                                            </div>
                                            <div className="space-y-1.5 max-w-[240px] mx-auto">
                                                <p className="text-sm font-black tracking-tight text-foreground">Workspace is Isolated</p>
                                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic opacity-70">
                                                    No identities have been provisioned for this environment yet.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-6 h-9 px-6 text-[10px] font-black uppercase tracking-widest rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm shadow-primary/5"
                                                onClick={() => setIsAddUserOpen(true)}
                                            >
                                                Provision Identity Now
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            {/* Footer Governance Note */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/[0.02] border border-primary/5 backdrop-blur-sm group hover:border-primary/10 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <BadgeCheck className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] text-foreground font-bold uppercase tracking-tight leading-none">Environmental Access Governance</p>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        Identity profiles are governed by the workspace's high-level security policy. Propagating updates across edge nodes may require a short synchronization interval.
                    </p>
                </div>
            </div>
        </div>
    )
}
