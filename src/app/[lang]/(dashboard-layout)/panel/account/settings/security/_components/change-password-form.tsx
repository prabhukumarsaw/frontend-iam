"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { ChangePasswordFormType } from "../../../types"

import { ChangePasswordSchema } from "../_schemas/change-password-schema"

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
import { apiRequest } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: ChangePasswordFormType) {
    try {
      await apiRequest("/auth/password/change", {
        method: "POST",
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      })

      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      })

      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-2">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ButtonLoading isLoading={isSubmitting} className="mt-2 w-fit">
          Set new password
        </ButtonLoading>
      </form>
    </Form>
  )
}
