import type { RequestInit } from "next/dist/server/web/spec-extension/request"

/**
 * Centralized HTTP client for talking to the IAM backend (prabhu-dashboard).
 *
 * The backend should be exposed via NEXT_PUBLIC_API_BASE_URL, e.g.
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
 */

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_URL ?? ""

if (!DEFAULT_API_BASE_URL) {
  const message =
    "[api-client] NEXT_PUBLIC_API_BASE_URL or API_URL is not defined. " +
    "Configure it to point at your prabhu-dashboard HTTP API."

  if (process.env.NODE_ENV === "production") {
    throw new Error(message)
  } else {
    // eslint-disable-next-line no-console
    console.warn(message)
  }
}

export class ApiError extends Error {
  readonly status: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly payload?: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status: number, payload?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

export interface ApiRequestOptions {
  method?: RequestInit["method"]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
  headers?: HeadersInit
  /** Attach Authorization header if provided */
  accessToken?: string | null
  /** Optional tenant slug to scope the request */
  tenantSlug?: string | null
  /** Optional tenant id header override */
  tenantId?: string | null
}

import { refreshTokens } from "./auth"
import { useAuthStore } from "@/stores/auth-store"

// Mutex-like flags for coordinating token refresh across concurrent requests
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token))
  refreshSubscribers = []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const baseUrl = DEFAULT_API_BASE_URL.replace(/\/$/, "")
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`

  const isFormData = options.body instanceof FormData

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers ?? {}),
  }

  // Use provided accessToken or fall back to store if authenticated
  let currentToken = options.accessToken
  if (!currentToken && typeof window !== "undefined") {
    currentToken = useAuthStore.getState().accessToken
  }

  if (currentToken) {
    ; (headers as Record<string, string>).Authorization = `Bearer ${currentToken}`
  }

  // Multi-tenant support – prefer explicit tenant headers when provided.
  if (options.tenantSlug) {
    ; (headers as Record<string, string>)["x-tenant-slug"] = options.tenantSlug
  }
  if (options.tenantId) {
    ; (headers as Record<string, string>)["x-tenant-id"] = options.tenantId
  }

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  }

  if (options.body !== undefined) {
    init.body = isFormData ? options.body : JSON.stringify(options.body)
  }

  const res = await fetch(url, init)

  // Handle 401 Unauthorized - attempt token refresh
  if (res.status === 401 && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
    const { refreshToken, tenantSlug, tenantId, setAuthPayload, clear, user } = useAuthStore.getState()

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newTokens = await refreshTokens({
            refreshToken,
            tenantSlug: tenantSlug ?? undefined,
            tenantId: tenantId ?? undefined
          })

          if (user) {
            setAuthPayload({ ...newTokens, user })
          }

          onRefreshed(newTokens.accessToken)
          isRefreshing = false

          // Retry the original request with the new token
          return apiRequest<T>(path, { ...options, accessToken: newTokens.accessToken })
        } catch (refreshError) {
          isRefreshing = false
          clear()
          // Forward the original 401 if refresh fails
        }
      } else {
        // Wait for refresh to complete and retry
        return new Promise<T>((resolve) => {
          subscribeTokenRefresh((newToken) => {
            resolve(apiRequest<T>(path, { ...options, accessToken: newToken }))
          })
        })
      }
    }
  }

  const text = await res.text()

  // Try to decode JSON, but don't assume the backend always returns JSON.
  let payload: unknown = undefined
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  // Backends typically wrap data as { success, data, message }
  // Normalise failures into ApiError so callers can rely on message + status.
  if (!res.ok) {
    const message =
      (payload as { message?: string } | undefined)?.message ??
      `Request to ${path} failed with status ${res.status}`

    throw new ApiError(message, res.status, payload)
  }

  return payload as T
}

/**
 * Returns an absolute URL for a given path, prepending the API base URL if needed.
 */
export function getAbsoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path
  }

  const baseUrl = DEFAULT_API_BASE_URL.trim().replace(/\/$/, "")

  // Extract path from base URL to check for duplication
  // e.g. baseUrl = http://localhost:5177/api/v1, prefix = /api/v1
  let prefix = "";
  try {
    prefix = new URL(baseUrl).pathname.replace(/\/$/, "");
  } catch (e) {
    // If baseUrl is not a full URL (e.g. just /api/v1)
    prefix = baseUrl.replace(/^(?:https?:\/\/[^\/]+)?/, "").replace(/\/$/, "");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (prefix && normalizedPath.startsWith(prefix)) {
    // Path already includes prefix, append to origin
    try {
      const origin = new URL(baseUrl).origin;
      return `${origin}${normalizedPath}`;
    } catch (e) {
      // Fallback if origin cannot be determined
      return normalizedPath;
    }
  }

  return `${baseUrl}${normalizedPath}`
}

