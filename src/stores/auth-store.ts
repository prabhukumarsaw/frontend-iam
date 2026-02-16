"use client"

import { create, type StateCreator } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"

import type { BackendUser, AuthPayload } from "@/lib/api/auth"

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"

export interface AuthState {
  user: BackendUser | null
  accessToken: string | null
  refreshToken: string | null
  tenantId: string | null
  tenantSlug: string | null
  status: AuthStatus
  error: string | null

  /** Hydrate the store from a NextAuth session-like payload */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFromSession: (session: any | null) => void
  setAuthPayload: (payload: AuthPayload, tenantSlug?: string | null) => void
  updateUser: (user: Partial<BackendUser>) => void
  clear: () => void
}

const authStoreImpl: StateCreator<AuthState> = (set: (partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>)) => void) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  tenantId: null,
  tenantSlug: process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? null,
  status: "idle",
  error: null,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFromSession(session: any) {
    if (!session || !session.user) {
      set(() => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        tenantId: null,
        status: "unauthenticated",
        error: null,
      }))
      return
    }

    const user = session.user as BackendUser
    const accessToken = (session as { accessToken?: string }).accessToken ?? null
    const refreshToken =
      (session as { refreshToken?: string }).refreshToken ?? null
    const tenantId =
      (session as { tenantId?: string }).tenantId ?? user.tenantId ?? null
    const tenantSlug =
      (session as { tenantSlug?: string }).tenantSlug ??
      (user as { tenant?: { slug?: string } }).tenant?.slug ??
      null

    set(() => ({
      user,
      accessToken,
      refreshToken,
      tenantId,
      tenantSlug,
      status: "authenticated",
      error: null,
    }))
  },

  setAuthPayload(payload: AuthPayload, tenantSlug?: string | null) {
    // Sync to cookie for middleware support
    Cookies.set("auth-token", payload.accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    })

    set(() => ({
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      tenantId: payload.user.tenantId,
      tenantSlug:
        tenantSlug ??
        (payload.user as { tenant?: { slug?: string } }).tenant?.slug ??
        null,
      status: "authenticated",
      error: null,
    }))
  },

  updateUser(userData: Partial<BackendUser>) {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }))
  },

  clear(): void {
    Cookies.remove("auth-token")

    set(() => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      status: "unauthenticated",
      error: null,
    }))
  },
})

export const useAuthStore = create<AuthState>()(
  persist(authStoreImpl, {
    name: "auth-store",
    partialize: (state: AuthState) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      tenantId: state.tenantId,
      tenantSlug: state.tenantSlug,
    }),
  }),
)

