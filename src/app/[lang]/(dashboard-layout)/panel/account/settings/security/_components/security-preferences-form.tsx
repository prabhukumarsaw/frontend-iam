"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { ComponentProps } from "react"
import type { SecurityPreferencesFormType, UserType } from "../../../types"

import { SecurityPreferencesSchema } from "../_schemas/security-preferences-form-schema"

import { ButtonLoading } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useAuthStore } from "@/stores/auth-store"
import { apiRequest } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"

interface SecurityPreferencesFormProps extends ComponentProps<"form"> {
  user: UserType
}

export function SecurityPreferencesForm({
  user,
}: SecurityPreferencesFormProps) {
  const updateUserStore = useAuthStore((state) => state.updateUser)
  const form = useForm<SecurityPreferencesFormType>({
    resolver: zodResolver(SecurityPreferencesSchema),
    defaultValues: {
      twoFactorAuth: user.twoFactorAuth,
      loginAlerts: user.loginAlerts,
    },
  })

  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  async function onSubmit(data: SecurityPreferencesFormType) {
    try {
      const updatedUser = await apiRequest("/auth/me", {
        method: "PATCH",
        body: {
          mfaEnabled: data.twoFactorAuth,
          loginAlerts: data.loginAlerts,
        },
      })

      // Update the global auth store
      updateUserStore(updatedUser)

      toast({
        title: "Preferences saved",
        description: "Your security preferences have been successfully updated.",
      })

      form.reset(data)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-3">
        <FormField
          control={form.control}
          name="twoFactorAuth"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable 2-Step Authentication</FormLabel>
              </div>
              <FormDescription>
                Add an extra security layer with 2-step authentication for
                better account protection.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loginAlerts"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Login Alerts</FormLabel>
              </div>
              <FormDescription>
                Receive notifications for login activities to stay informed
                about access to your account.
              </FormDescription>
            </FormItem>
          )}
        />

        <ButtonLoading
          isLoading={isSubmitting}
          disabled={isDisabled}
          className="mt-2 w-fit"
        >
          Save
        </ButtonLoading>
      </form>
    </Form>
  )
}
