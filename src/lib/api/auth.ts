import { apiRequest, ApiError } from "./client"

export interface BackendUser {
  id: string
  email: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  tenantId: string
  // loose typing for additional fields coming from backend (roles, settings, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  sessionId: string
}

export interface AuthPayload extends AuthTokens {
  user: BackendUser
}

interface Envelope<T> {
  success: boolean
  data?: T
  message?: string
}

export interface LoginInput {
  email?: string
  username?: string
  password: string
  tenantSlug?: string
  tenantId?: string
}

export interface RegisterInput {
  email: string
  username?: string
  password: string
  firstName?: string
  lastName?: string
  tenantSlug?: string
  tenantId?: string
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const { tenantSlug, tenantId, ...credentials } = input

  const payload = await apiRequest<Envelope<AuthPayload>>("/auth/login", {
    method: "POST",
    body: credentials,
    tenantSlug: tenantSlug ?? null,
    tenantId: tenantId ?? null,
  })

  if (!payload.success || !payload.data) {
    throw new ApiError(payload.message ?? "Login failed", 400, payload)
  }

  return payload.data
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const { tenantSlug, tenantId, ...body } = input

  const payload = await apiRequest<Envelope<AuthPayload>>("/auth/register", {
    method: "POST",
    body,
    tenantSlug: tenantSlug ?? null,
    tenantId: tenantId ?? null,
  })

  if (!payload.success || !payload.data) {
    throw new ApiError(payload.message ?? "Registration failed", 400, payload)
  }

  return payload.data
}

export async function requestPasswordReset(params: {
  email: string
  tenantSlug?: string
  tenantId?: string
}): Promise<void> {
  const { tenantSlug, tenantId, email } = params

  const payload = await apiRequest<Envelope<unknown>>("/auth/password/forgot", {
    method: "POST",
    body: { email },
    tenantSlug: tenantSlug ?? null,
    tenantId: tenantId ?? null,
  })

  if (!payload.success) {
    throw new ApiError(
      payload.message ?? "Unable to request password reset",
      400,
      payload,
    )
  }
}

export async function updateProfile(
  input: Partial<BackendUser>,
): Promise<BackendUser> {
  const payload = await apiRequest<Envelope<{ user: BackendUser }>>(
    "/auth/me",
    {
      method: "PATCH",
      body: input,
    },
  )

  if (!payload.success || !payload.data) {
    throw new ApiError(
      payload.message ?? "Failed to update profile",
      400,
      payload,
    )
  }

  return payload.data.user
}

export async function refreshTokens(params: {
  refreshToken: string
  tenantSlug?: string
  tenantId?: string
}): Promise<AuthTokens> {
  const { tenantSlug, tenantId, refreshToken } = params

  const payload = await apiRequest<Envelope<AuthTokens>>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    tenantSlug: tenantSlug ?? null,
    tenantId: tenantId ?? null,
  })

  if (!payload.success || !payload.data) {
    throw new ApiError(
      payload.message ?? "Unable to refresh tokens",
      401,
      payload,
    )
  }

  return payload.data
}

