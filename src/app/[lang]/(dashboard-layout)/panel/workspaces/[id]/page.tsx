"use client"

import { useParams, useRouter } from "next/navigation"
import { TenantDetails } from "../_components/tenant-details"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LayoutPanelLeft } from "lucide-react"

export default function WorkspaceDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    return (
        <div className="flex flex-col gap-6 min-h-screen pb-10 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col gap-4 py-4 border-b">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/${params.lang}/panel/workspaces`)}
                        className="-ml-2 h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Workspaces</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">Details</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <LayoutPanelLeft className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Workspace Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Detailed node configuration and runtime status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-none mx-auto">
                <TenantDetails tenantId={id} isPage={true} />
            </div>
        </div>
    )
}
