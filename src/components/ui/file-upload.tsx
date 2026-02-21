"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, X, FileIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { getAbsoluteUrl } from "@/lib/api/client"

interface FileUploadProps {
    value?: string | File | null
    onChange: (file: File | null) => void
    disabled?: boolean
    className?: string
    accept?: Record<string, string[]>
    maxSize?: number // in bytes
    variant?: "default" | "avatar"
}

export function FileUpload({
    value,
    onChange,
    disabled,
    className,
    accept = {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize = 5 * 1024 * 1024, // 5MB default
    variant = "default",
}: FileUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else if (typeof value === "string") {
            setPreviewUrl(getAbsoluteUrl(value) || null)
        } else {
            setPreviewUrl(null)
        }
    }, [value])

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (rejectedFiles.length > 0) {
                const error = rejectedFiles[0].errors[0]
                if (error.code === "file-too-large") {
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: `Please upload a file smaller than ${maxSize / 1024 / 1024}MB`,
                    })
                } else {
                    toast({
                        variant: "destructive",
                        title: "Invalid file",
                        description: error.message,
                    })
                }
                return
            }

            if (acceptedFiles.length > 0) {
                onChange(acceptedFiles[0])
            }
        },
        [maxSize, onChange]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        disabled,
        multiple: false,
    })

    const handleRemove = () => {
        onChange(null)
    }

    if (previewUrl) {
        if (variant === "avatar") {
            return (
                <div className={cn("relative group w-32 h-32 mx-auto overflow-hidden rounded-full border-4 border-muted/20 bg-background shadow-md", className)}>
                    <img
                        src={previewUrl}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className={cn("relative overflow-hidden rounded-lg border bg-background", className)}>
                <div className="relative aspect-video w-full flex items-center justify-center bg-muted/30 p-2">
                    <img
                        src={previewUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                    />
                </div>
                <div className="flex items-center justify-between p-2 border-t bg-muted/10">
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {value instanceof File ? value.name : (typeof value === "string" ? value.split('/').pop() : "Image")}
                    </span>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-muted/5 transition-colors hover:bg-muted/10",
                variant === "avatar" ? "w-32 h-32 rounded-full mx-auto" : "rounded-lg p-6",
                isDragActive && "border-primary/50 bg-primary/5",
                disabled && "cursor-not-allowed opacity-60",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className={cn("rounded-full bg-muted flex items-center justify-center", variant === "avatar" ? "h-10 w-10" : "p-2")}>
                    <Upload className={cn("text-muted-foreground", variant === "avatar" ? "h-5 w-5" : "h-4 w-4")} />
                </div>
                {variant !== "avatar" && (
                    <div className="text-sm">
                        <p className="font-medium text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or
                            drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG or GIF (max {maxSize / 1024 / 1024}MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
