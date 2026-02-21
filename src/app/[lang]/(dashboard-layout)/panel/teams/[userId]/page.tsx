"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { apiRequest, getAbsoluteUrl } from "@/lib/api/client"
import { getInitials } from "@/lib/utils"
import {
    ArrowLeft,
    CheckCircle2,
    Ban,
    User,
    Mail,
    MapPin,
    Phone,
    Building,
    Activity
} from "lucide-react"

export default function ViewUserPage() {
    const params = useParams()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const userId = params.userId as string

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await apiRequest(`/users/${userId}`)
                // Handle different response structures gracefully
                setUser(res.data?.user || res.data || res)
            } catch (error) {
                console.error("Failed to fetch user", error)
            } finally {
                setLoading(false)
            }
        }
        if (userId) {
            fetchUser()
        }
    }, [userId])

    if (loading) {
        return (
            <div className="flex p-8 justify-center items-center min-h-[50vh]">
                <Activity className="h-6 w-6 text-primary animate-spin" />
            </div>
        )
    }

    if (!user || Object.keys(user).length === 0) {
        return (
            <div className="flex flex-col p-8 justify-center items-center min-h-[50vh] gap-4">
                <p>User not found</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        )
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email || 'Unknown User'
    const background = user.background

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 min-h-screen pb-10">
            {/* Header Section based on ProfileHeader */}
            <section className="bg-background border rounded-2xl shadow-sm overflow-hidden">
                <div className="relative">
                    <AspectRatio ratio={6 / 1} className="bg-muted overflow-hidden">
                        {background ? (
                            <Image
                                src={getAbsoluteUrl(background) || "/placeholder-bg.jpg"}
                                fill
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                alt="Profile Background"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-primary/10 to-secondary/10" />
                        )}
                    </AspectRatio>
                </div>

                <div className="px-4 lg:px-8">
                    <div className="relative flex flex-col gap-6 pb-6 pt-2 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
                            <Avatar className="size-32 -mt-16 ring-4 ring-background md:size-40 md:-mt-20 bg-muted">
                                <AvatarImage
                                    src={getAbsoluteUrl(user.avatar)}
                                    alt={name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-3xl font-extrabold text-primary">
                                    {getInitials(name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col items-center text-center md:items-start md:pb-1 md:text-start">
                                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl flex items-center gap-3">
                                    {name}
                                    {user.isActive ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[11px] font-bold uppercase tracking-widest border border-slate-500/20">
                                            <Ban className="h-3.5 w-3.5" /> Suspended
                                        </span>
                                    )}
                                </h1>
                                <p className="mt-1 text-muted-foreground font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {user.state && `${user.state}, `}
                                    {user.country || "Unspecified Location"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 md:pb-1 lg:gap-3 pb-4">
                            <Button variant="outline" onClick={() => router.back()} className="rounded-full gap-2 px-6 bg-background/50 backdrop-blur-sm transition-all hover:bg-muted font-semibold">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Directory
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content mimicking ProfileInfo */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="rounded-2xl border-muted/20 shadow-sm leading-relaxed">
                    <CardHeader className="border-b border-muted/10 pb-6 mb-6">
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                            <User className="h-6 w-6 text-primary" /> Profile Information
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Detailed view of the user's public and environmental profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Profile Info Display Grid */}
                        <div className="grid gap-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">First Name</Label>
                                    <Input value={user.firstName || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Last Name</Label>
                                    <Input value={user.lastName || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Username</Label>
                                    <Input value={user.username || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={user.email || ''} readOnly className="pl-10 bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={user.phone || ''} readOnly className="pl-10 bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Organization / Affiliation</Label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={user.organization || ''} readOnly className="pl-10 bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-muted/10 my-4" />

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">State / Region</Label>
                                    <Input value={user.state || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Country</Label>
                                    <Input value={user.country || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Address</Label>
                                    <Input value={user.address || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Zip Code</Label>
                                    <Input value={user.zipCode || ''} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Preferred Language</Label>
                                    <Input value={user.locale || user.language || 'en'} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Time Zone</Label>
                                    <Input value={user.timezone || user.timeZone || 'UTC'} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Currency</Label>
                                    <Input value={user.currency || 'USD'} readOnly className="bg-muted/30 border-muted/20 font-medium h-12 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
