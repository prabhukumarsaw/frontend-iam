"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { LocaleType, RegisterFormType } from "@/types"

import { RegisterSchema } from "@/schemas/register-schema"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/hooks/use-toast"
import { register as registerUser } from "@/lib/api/auth"
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

export function RegisterForm() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const tenantSlug = useAuthStore((state) => state.tenantSlug)

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
  })

  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")
  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  const setAuthPayload = useAuthStore((state) => state.setAuthPayload)

  async function onSubmit(data: RegisterFormType) {
    const { firstName, lastName, username, email, password } = data

    try {
      const payload = await registerUser({
        firstName,
        lastName,
        username,
        email,
        password,
        tenantSlug:
          tenantSlug ?? process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? undefined,
      })

      // Automatically sign in
      setAuthPayload(payload)

      toast({
        title: "Register Successful",
        description: "Your account has been created and you are now signed in.",
      })

      router.push(
        ensureLocalizedPathname(
          redirectPathname || "/dashboards/analytics",
          locale
        )
      )
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Register Failed",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="john_doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          Create Account
        </ButtonLoading>
        <div className="-mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            href={ensureLocalizedPathname(
              // Include redirect pathname if available, otherwise default to "/sign-in"
              redirectPathname
                ? ensureRedirectPathname("/sign-in", redirectPathname)
                : "/sign-in",
              locale
            )}
            className="underline"
          >
            Sign in
          </Link>
        </div>
        <SeparatorWithText>Or continue with</SeparatorWithText>
        <OAuthLinks />
      </form>
    </Form>
  )
}
