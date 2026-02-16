"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TenantFormType, TenantSchema } from "../../_schemas/tenant-schema"
import { apiRequest } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button, ButtonLoading } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"

interface TenantFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function TenantForm({ initialData, onSuccess, onCancel }: TenantFormProps) {
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<TenantFormType>({
        resolver: zodResolver(TenantSchema),
        values: initialData ? {
            name: initialData.name,
            slug: initialData.slug,
            domain: initialData.domain || "",
            logo: initialData.logo || "",
            isActive: initialData.isActive,
        } : {
            name: "",
            slug: "",
            domain: "",
            logo: "",
            isActive: true,
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(data: TenantFormType) {
        try {
            let logoUrl = data.logo

            if (logoFile) {
                setIsUploading(true)
                const formData = new FormData()
                formData.append("file", logoFile)
                formData.append("isPublic", "true")
                formData.append("metadata", JSON.stringify({ type: "logo" }))

                const res = await apiRequest("/files/upload", {
                    method: "POST",
                    body: formData,
                })

                if (res.data?.url) {
                    logoUrl = res.data.url
                } else if (res.data?.path) {
                    logoUrl = res.data.path
                }
            }

            const payload = { ...data, logo: logoUrl }

            if (initialData) {
                await apiRequest(`/tenants/${initialData.id}`, {
                    method: "PATCH",
                    body: payload,
                })
                toast({ title: "Tenant updated", description: "Tenant has been successfully updated." })
            } else {
                await apiRequest("/tenants", {
                    method: "POST",
                    body: payload,
                })
                toast({ title: "Tenant created", description: "New tenant has been successfully created." })
            }
            onSuccess()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Operation failed",
                description: error instanceof Error ? error.message : "Something went wrong",
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Corp" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                                <Input placeholder="acme" {...field} disabled={!!initialData} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Domain (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://acme.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                                <FileUpload
                                    value={logoFile || field.value}
                                    onChange={(file) => {
                                        if (file) {
                                            setLogoFile(file)
                                        } else {
                                            setLogoFile(null)
                                            field.onChange("")
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {initialData && (
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Active Status</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <ButtonLoading isLoading={isSubmitting || isUploading}>
                        {initialData ? "Save Changes" : "Create Tenant"}
                    </ButtonLoading>
                </div>
            </form>
        </Form>
    )
}
