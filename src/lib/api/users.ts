import { apiRequest, type ApiRequestOptions } from "./client"

export interface BackendUserSummary {
  id: string
  email: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  isActive?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface PaginatedUsers {
  users: BackendUserSummary[]
  total: number
  page: number
  limit: number
}

interface Envelope<T> {
  success: boolean
  data?: T
  message?: string
}

export async function listUsers(
  params: {
    page?: number
    limit?: number
    search?: string
  } = {},
  auth?: Pick<ApiRequestOptions, "accessToken">,
): Promise<PaginatedUsers> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.search) searchParams.set("search", params.search)

  const query = searchParams.toString()
  const path = `/users${query ? `?${query}` : ""}`

  const payload = await apiRequest<Envelope<PaginatedUsers>>(path, {
    method: "GET",
    accessToken: auth?.accessToken ?? null,
  })

  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? "Unable to load users")
  }

  return payload.data
}

