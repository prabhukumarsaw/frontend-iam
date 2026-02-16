"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { LocaleType, SignInFormType } from "@/types"

import { SignInSchema } from "@/schemas/sign-in-schema"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/hooks/use-toast"
import { login } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"
import { ButtonLoading } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SeparatorWithText } from "@/components/ui/separator"
import { OAuthLinks } from "./oauth-links"

export function SignInForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tenantSlug = useAuthStore((state) => state.tenantSlug)

  const redirectPathname =
    searchParams.get("redirectTo") ||
    process.env.NEXT_PUBLIC_HOME_PATHNAME ||
    "/"

  const form = useForm<SignInFormType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  const locale = params.lang as LocaleType
  const { isSubmitting } = form.formState
  const isDisabled = isSubmitting // Disable button if form is submitting

  async function onSubmit(data: SignInFormType) {
    const { identifier, password } = data
    const isEmail = identifier.includes("@")

    try {
      const payload = await login({
        email: isEmail ? identifier : undefined,
        username: !isEmail ? identifier : undefined,
        password,
        tenantSlug: tenantSlug ?? process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? "default",
      })

      // Update store and cookies
      useAuthStore.getState().setAuthPayload(payload, tenantSlug)

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      router.push(redirectPathname)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid grow gap-2">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="name@example.com or username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={ensureLocalizedPathname(
                      // Include redirect pathname if available, otherwise default to "/forgot-password"
                      redirectPathname
                        ? ensureRedirectPathname(
                          "/forgot-password",
                          redirectPathname
                        )
                        : "/forgot-password",
                      locale
                    )}
                    className="ms-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          Sign In
        </ButtonLoading>
        <div className="-mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={ensureLocalizedPathname(
              // Include redirect pathname if available, otherwise default to "/register"
              redirectPathname
                ? ensureRedirectPathname("/register", redirectPathname)
                : "/register",
              locale
            )}
            className="underline"
          >
            Sign up
          </Link>
        </div>
        <SeparatorWithText>Or continue with</SeparatorWithText>
        <OAuthLinks />
      </form>
    </Form>
  )
}
