import { useAuthStore } from "@/stores/auth-store"
import { apiRequest } from "./client"

export interface FileResponse {
    id: string
    name: string
    originalName: string
    mimeType: string
    size: number
    path: string
    url: string
    isPublic: boolean
    metadata: Record<string, unknown>
}

interface Envelope<T> {
    success: boolean
    data?: T
    message?: string
}

/**
 * Upload a file to the backend
 */
export async function uploadFile(
    file: File,
    isPublic = true,
    metadata?: Record<string, unknown>,
): Promise<FileResponse> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("isPublic", String(isPublic))
    if (metadata) {
        formData.append("metadata", JSON.stringify(metadata))
    }

    const { accessToken, tenantSlug, tenantId } = useAuthStore.getState()

    const payload = await apiRequest<Envelope<FileResponse>>("/files", {
        method: "POST",
        body: formData,
        accessToken,
        tenantSlug,
        tenantId,
    })

    if (!payload.success || !payload.data) {
        throw new Error(payload.message ?? "File upload failed")
    }

    return payload.data
}
