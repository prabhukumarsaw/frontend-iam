"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { LocaleType, VerifyEmailFormType } from "@/types"

import { VerifyEmailSchema } from "@/schemas/verify-email-schema"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { toast } from "@/hooks/use-toast"
import { buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function VerifyEmailForm() {
  const params = useParams()
  const form = useForm<VerifyEmailFormType>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  const locale = params.lang as LocaleType

  async function onSubmit(data: VerifyEmailFormType) {
    try {
      toast({
        title: "Check your email",
        description:
          "We've sent you an email with instructions to verify your email address.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
        <Link
          href={ensureLocalizedPathname(
            process.env.NEXT_PUBLIC_HOME_PATHNAME || "/",
            locale
          )}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Skip for now
        </Link>
        <div className="text-center text-sm">
          Didn&apos;t receive the email?{" "}
          <button type="submit" className="underline bg-transparent border-none p-0 cursor-pointer">
            Resend
          </button>
        </div>
      </form>
    </Form>
  )
}
