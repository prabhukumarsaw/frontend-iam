"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api/client"
import { useState, useEffect, useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { FileUpload } from "@/components/ui/file-upload"
import {
    CheckCircle2,
    UserPlus,
    Shield,
    Info,
    Layout,
    Mail,
    User,
    Phone,
    BadgeCheck,
    Globe,
    MapPin,
    Building,
    Coins,
    Languages,
    Clock,
    Lock,
    UserCircle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Box,
    Activity
} from "lucide-react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const getGlobalUserSchema = (isEdit: boolean) => z.object({
    tenantId: z.string().min(1, { message: "Workspace selection is required" }),
    avatar: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    phone: z.string().optional(),
    password: z.string().optional(), // Now optional even for creation
    roleIds: z.array(z.string()).min(1, { message: "At least one role is required" }),
    organization: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    currency: z.string().default("USD"),
    locale: z.string().default("en"),
    timezone: z.string().default("UTC"),
    isActive: z.boolean().default(true),
})

interface GlobalUserFormProps {
    onSuccess: () => void
    onCancel: () => void
    editData?: any
}

export function GlobalUserForm({ onSuccess, onCancel, editData }: GlobalUserFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [tenants, setTenants] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("profile")

    const isEdit = !!editData
    const schema = useMemo(() => getGlobalUserSchema(isEdit), [isEdit])

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            tenantId: editData?.tenantId || "",
            avatar: editData?.avatar || "",
            email: editData?.email || "",
            username: editData?.username || "",
            firstName: editData?.firstName || "",
            lastName: editData?.lastName || "",
            phone: editData?.phone || "",
            password: "",
            roleIds: editData?.roles?.map((r: any) => r.id) || [],
            organization: editData?.organization || "",
            address: editData?.address || "",
            state: editData?.state || "",
            country: editData?.country || "United States",
            zipCode: editData?.zipCode || "",
            currency: editData?.currency || "USD",
            locale: editData?.locale || "en",
            timezone: editData?.timezone || "UTC",
            isActive: editData && editData.isActive !== undefined ? editData.isActive : true,
        },
    })

    const selectedTenantId = form.watch("tenantId")

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
        async function fetchRoles() {
            if (!selectedTenantId) {
                setRoles([])
                return
            }
            try {
                const res = await apiRequest("/roles", { tenantId: selectedTenantId })
                setRoles(res.data.roles || [])
            } catch (error) {
                console.error("Failed to fetch roles", error)
            }
        }

        // Do not reset roleIds unconditionally on edit mode for the initial load if the tenant hasn't really "changed" by user action
        // Actually, just fetchRoles will be enough.
        if (!isEdit || form.getValues("tenantId") !== editData?.tenantId) {
            form.setValue("roleIds", [])
        }

        fetchRoles()
    }, [selectedTenantId, form])

    async function onSubmit(values: z.infer<typeof schema>) {
        try {
            setLoading(true)
            const { tenantId, password, ...restValues } = values;

            let finalAvatarUrl = restValues.avatar;

            if (avatarFile) {
                const formData = new FormData()
                formData.append("file", avatarFile)
                formData.append("isPublic", "true")
                formData.append("metadata", JSON.stringify({ type: "avatar" }))

                const res = await apiRequest("/files/upload", {
                    method: "POST",
                    body: formData,
                })

                if (res.data?.url) {
                    finalAvatarUrl = res.data.url
                } else if (res.data?.path) {
                    finalAvatarUrl = res.data.path
                }
            }

            const body: any = { ...restValues, avatar: finalAvatarUrl, tenantId }
            if (password) {
                body.password = password
            }

            let generatedPassword = ""
            if (isEdit) {
                await apiRequest(`/users/${editData.id}`, {
                    method: "PATCH",
                    tenantId: tenantId,
                    body: body,
                })
            } else {
                if (!body.password) {
                    generatedPassword = Math.random().toString(36).slice(-8) + "Aa1!"
                    body.password = generatedPassword
                }
                await apiRequest("/users", {
                    method: "POST",
                    tenantId: tenantId,
                    body: body,
                })
            }

            if (generatedPassword) {
                toast({
                    title: "Identity Provisioned Successfully",
                    description: `The default password is: ${generatedPassword}`,
                    duration: 30000,
                    action: (
                        <ToastAction
                            altText="Copy password"
                            onClick={(e) => {
                                navigator.clipboard.writeText(generatedPassword);
                            }}
                        >
                            Copy
                        </ToastAction>
                    )
                })
            } else if (!isEdit) {
                toast({
                    title: "Identity Provisioned Successfully",
                    description: "The new workspace user has been assigned their starting parameters.",
                })
            } else {
                toast({
                    title: "Identity Updated",
                    description: "The workspace user identity parameters were permanently synced.",
                })
            }
            onSuccess()
        } catch (error: any) {
            const errorMsg = error.message || "Failed to process the request."
            toast({
                variant: "destructive",
                title: "Provisioning Sequence Terminated",
                description: errorMsg,
            })
            // Switch to identity tab if the error is email/username related so they can fix it immediately
            if (errorMsg.toLowerCase().includes("email") || errorMsg.toLowerCase().includes("username")) {
                if (errorMsg.toLowerCase().includes("email")) setActiveTab("profile");
                if (errorMsg.toLowerCase().includes("username")) setActiveTab("security");
            }
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: "profile", label: "Identity", icon: UserCircle },
        { id: "security", label: "Access", icon: Shield },
        { id: "location", label: "Regional", icon: Globe },
        { id: "preferences", label: "Settings", icon: Layout },
    ]

    const currentIndex = tabs.findIndex(t => t.id === activeTab)
    const progress = ((currentIndex + 1) / tabs.length) * 100

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    }
                }}
            >
                <div className="space-y-4">
                    {/* Compact Step Indicator */}
                    <div className="flex items-center gap-4 px-1">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3" /> Step {currentIndex + 1} of {tabs.length}: {tabs[currentIndex].label}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground">{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-1 bg-primary/10" />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full h-auto bg-transparent p-0 gap-1 border-none justify-start overflow-x-auto no-scrollbar pb-1">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "flex-1 min-w-[100px] md:min-w-0 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:shadow-primary/20",
                                        form.formState.errors[tab.id as keyof z.infer<typeof schema>] && "border-destructive/50 text-destructive bg-destructive/[0.02]"
                                    )}
                                >
                                    <tab.icon className="h-3.5 w-3.5 mr-2 shrink-0" />
                                    <span className="truncate">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="mt-4">
                            <ScrollArea className="h-[380px] w-full pr-4 -mr-4">
                                <div className="p-1 pb-4">
                                    <TabsContent value="profile" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 outline-none">

                                        <FormField
                                            control={form.control}
                                            name="tenantId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5 p-4 rounded-xl border border-primary/20 bg-primary/[0.02] shadow-sm">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                                        <Box className="h-4 w-4 text-primary" /> Target Workspace
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 text-xs font-semibold bg-background border-primary/10 rounded-lg shadow-inner">
                                                                <SelectValue placeholder="Select a workspace environment" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-muted/20 shadow-xl">
                                                            {tenants.map(tenant => (
                                                                <SelectItem key={tenant.id} value={tenant.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-5 w-5 rounded bg-muted flex items-center justify-center font-bold text-[9px] text-muted-foreground uppercase">{tenant.name.substring(0, 2)}</div>
                                                                        <span className="font-semibold text-xs">{tenant.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="avatar"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5 p-4 rounded-xl border border-muted/20 bg-muted/5 shadow-sm">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                        <UserCircle className="h-4 w-4 text-primary" /> Profile Portrait (Optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <FileUpload
                                                            value={avatarFile || field.value}
                                                            variant="avatar"
                                                            onChange={(file) => {
                                                                if (file) {
                                                                    setAvatarFile(file)
                                                                } else {
                                                                    setAvatarFile(null)
                                                                    field.onChange("")
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <User className="h-3 w-3 text-primary" /> First Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" {...field} className="h-9 text-xs bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-lg" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <User className="h-3 w-3 text-primary" /> Last Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Doe" {...field} className="h-9 text-xs bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-lg" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-primary" /> Email Identity
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john.doe@athena-systems.io" {...field} className="h-9 text-xs bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-lg" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3 text-primary" /> Direct Contact
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+1 (555) 000-0000" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="organization"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <Building className="h-3 w-3 text-primary" /> Affiliation
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Acme Global Corp" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="security" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 outline-none">
                                        {!selectedTenantId && (
                                            <div className="p-6 text-center border border-dashed rounded-xl bg-muted/10 border-muted/30">
                                                <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                                <p className="text-sm font-semibold">Workspace Required</p>
                                                <p className="text-xs text-muted-foreground mt-1">Please select a workspace on the Identity tab to configure access architecture.</p>
                                            </div>
                                        )}

                                        {selectedTenantId && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="username"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                                    <UserPlus className="h-3 w-3 text-primary" /> Username / Alias
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="j.doe_node" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                                    <Lock className="h-3 w-3 text-primary" /> Password
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input type="password" placeholder="Leave empty to auto-generate" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Roles & Permissions
                                                        </FormLabel>
                                                        <span className="text-[10px] font-bold text-primary/60 italic">{form.watch("roleIds").length} Selected</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {roles.length === 0 ? (
                                                            <div className="col-span-full p-4 border rounded-xl bg-muted/5 text-center text-xs text-muted-foreground italic">
                                                                Fetching environmental roles...
                                                            </div>
                                                        ) : (
                                                            roles.map((role) => (
                                                                <FormField
                                                                    key={role.id}
                                                                    control={form.control}
                                                                    name="roleIds"
                                                                    render={({ field }) => (
                                                                        <FormItem
                                                                            className={cn(
                                                                                "flex flex-row items-center space-x-3 space-y-0 p-3 rounded-2xl border transition-all hover:bg-muted/50 cursor-pointer group",
                                                                                field.value?.includes(role.id)
                                                                                    ? "bg-primary/[0.04] border-primary/20 shadow-sm ring-1 ring-primary/5"
                                                                                    : "bg-muted/20 border-transparent"
                                                                            )}
                                                                        >
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(role.id)}
                                                                                    className="rounded-full h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform group-hover:scale-105"
                                                                                    onCheckedChange={(checked) => {
                                                                                        return checked
                                                                                            ? field.onChange([...(field.value || []), role.id])
                                                                                            : field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (value: string) => value !== role.id
                                                                                                )
                                                                                            )
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <div className="space-y-0.5 leading-none w-full">
                                                                                <FormLabel className="text-xs font-bold block w-full cursor-pointer pb-1">
                                                                                    {role.name}
                                                                                </FormLabel>
                                                                                <p className="text-[9px] text-muted-foreground line-clamp-1 italic pointer-events-none">
                                                                                    {role.description || "Inherent environmental access"}
                                                                                </p>
                                                                            </div>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                    <FormMessage className="text-[10px]" />
                                                </div>

                                                {isEdit && (
                                                    <div className="pt-4 border-t mt-4 border-dashed border-muted/30">
                                                        <FormField
                                                            control={form.control}
                                                            name="isActive"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center justify-between p-4 rounded-xl border border-muted/20 bg-muted/5 group hover:bg-muted/10 transition-colors cursor-pointer">
                                                                    <div className="space-y-0.5">
                                                                        <FormLabel className="text-xs font-bold flex items-center gap-2 cursor-pointer">
                                                                            <Activity className={cn("h-4 w-4", field.value ? "text-emerald-500" : "text-destructive")} />
                                                                            {field.value ? "Operational Account" : "Suspended Account"}
                                                                        </FormLabel>
                                                                        <p className="text-[10px] text-muted-foreground mr-10 leading-relaxed">
                                                                            {field.value ? "This user is fully authorized to login and access granted modules." : "This identity is locked. The user will be entirely stopped at login."}
                                                                        </p>
                                                                    </div>
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="location" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 outline-none">
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3 text-primary" /> Physical Environment
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Global HQ, Sector 7" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Regional District</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="California" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="zipCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Postal Key</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="90210" {...field} className="h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all rounded-xl focus:ring-2 focus:ring-primary/10" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                        <Globe className="h-3 w-3 text-primary" /> Nation State
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10 rounded-xl focus:ring-2 focus:ring-primary/10">
                                                                <SelectValue placeholder="Select Country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-muted-foreground/10">
                                                            <SelectItem value="United States">United States</SelectItem>
                                                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                                            <SelectItem value="Canada">Canada</SelectItem>
                                                            <SelectItem value="Germany">Germany</SelectItem>
                                                            <SelectItem value="India">India</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="preferences" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 outline-none">
                                        <div className="grid grid-cols-1 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="currency"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <Coins className="h-3.5 w-3.5 text-primary" /> Monetary unit
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10 rounded-xl">
                                                                    <SelectValue placeholder="Select Currency" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl">
                                                                <SelectItem value="USD">USD - United States Dollar</SelectItem>
                                                                <SelectItem value="EUR">EUR - Euro System</SelectItem>
                                                                <SelectItem value="GBP">GBP - British Sterling</SelectItem>
                                                                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="locale"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <Languages className="h-3.5 w-3.5 text-primary" /> Linguistic Interface
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10 rounded-xl">
                                                                    <SelectValue placeholder="Select Language" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl">
                                                                <SelectItem value="en">English (Global)</SelectItem>
                                                                <SelectItem value="fr">Français</SelectItem>
                                                                <SelectItem value="de">Deutsch</SelectItem>
                                                                <SelectItem value="es">Español</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="timezone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-primary" /> Temporal Reference
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10 rounded-xl">
                                                                    <SelectValue placeholder="Select Timezone" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl">
                                                                <SelectItem value="UTC">UTC (Coordinate Universal Time)</SelectItem>
                                                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                                                <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                                                                <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="p-4 rounded-2xl border border-dashed bg-primary/[0.02] mt-4 border-primary/20">
                                            <div className="flex items-start gap-3">
                                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Info className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Environmental parameters define the member's interaction baseline. These can be adjusted by the administrator later in the <strong>Member Dashboard</strong>.
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Unified Footer Actions */}
                <div className="pt-4 mt-2 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {activeTab !== "profile" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setActiveTab(tabs[currentIndex - 1].id);
                                }}
                                className="h-10 px-5 text-[11px] font-bold uppercase gap-2 border-muted-foreground/10 hover:bg-muted/50 rounded-xl"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous Phase
                            </Button>
                        )}
                        <div className="flex items-center gap-2 group cursor-help">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 group-hover:opacity-100 transition-opacity">Ready to sync</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none h-10 px-6 text-[11px] font-bold uppercase rounded-xl">
                            Cancel
                        </Button>
                        {activeTab !== "preferences" ? (
                            <Button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const fieldsToValidate: any = activeTab === "profile" ? ["tenantId", "firstName", "lastName", "email"] :
                                        activeTab === "security" ? ["username", "password", "roleIds"] :
                                            activeTab === "location" ? ["address", "state", "zipCode", "country"] :
                                                undefined;

                                    const isValid = await form.trigger(fieldsToValidate)
                                    if (isValid) {
                                        setActiveTab(tabs[currentIndex + 1].id)
                                    }
                                }}
                                className="flex-1 sm:flex-none h-10 px-8 text-[11px] font-bold uppercase bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-lg shadow-primary/10"
                            >
                                Next Segment <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none h-10 px-10 text-[11px] font-bold uppercase bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-xl shadow-primary/20">
                                {loading ? "Saving Identity..." : isEdit ? "Update Identity" : "Commit Provisioning"}
                                {!loading && <CheckCircle2 className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>

            </form>
        </Form>
    )
}
