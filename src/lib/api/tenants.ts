import { apiRequest, type ApiRequestOptions } from "./client"

export interface BackendTenant {
  id: string
  name: string
  slug: string
  domain?: string | null
  logo?: string | null
  isActive?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface PaginatedTenants {
  items: BackendTenant[]
  total: number
  page: number
  limit: number
}

interface Envelope<T> {
  success: boolean
  data?: T
  message?: string
}

export async function listTenants(
  params: { page?: number; limit?: number; search?: string } = {},
  auth?: Pick<ApiRequestOptions, "accessToken">,
): Promise<PaginatedTenants> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.search) searchParams.set("search", params.search)

  const query = searchParams.toString()
  const path = `/tenants${query ? `?${query}` : ""}`

  const payload = await apiRequest<Envelope<PaginatedTenants>>(path, {
    method: "GET",
    accessToken: auth?.accessToken ?? null,
  })

  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? "Unable to load tenants")
  }

  return payload.data
}

export async function getTenantBySlug(
  slug: string,
  auth?: Pick<ApiRequestOptions, "accessToken">,
): Promise<BackendTenant> {
  const payload = await apiRequest<Envelope<{ tenant: BackendTenant }>>(
    `/tenants/slug/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      accessToken: auth?.accessToken ?? null,
    },
  )

  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? "Tenant not found")
  }

  return payload.data.tenant
}

