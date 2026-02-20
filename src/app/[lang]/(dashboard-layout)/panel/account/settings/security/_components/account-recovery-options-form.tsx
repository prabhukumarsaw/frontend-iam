"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { ComponentProps } from "react"
import type { AccountRecoveryOptionsFormType, UserType } from "../../../types"

import { AccountRecoveryOptionsSchema } from "../_schemas/account-recovery-options-schema"

import { ButtonLoading } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { useAuthStore } from "@/stores/auth-store"
import { apiRequest } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"

interface AccountRecoveryOptionsFormProps extends ComponentProps<"form"> {
  user: UserType
}

export function AccountRecoveryOptionsForm({
  user,
}: AccountRecoveryOptionsFormProps) {
  const updateUserStore = useAuthStore((state) => state.updateUser)
  const form = useForm<AccountRecoveryOptionsFormType>({
    resolver: zodResolver(AccountRecoveryOptionsSchema),
    defaultValues: {
      option: user.accountRecoveryOption as any,
    },
  })

  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  async function onSubmit(data: AccountRecoveryOptionsFormType) {
    try {
      const updatedUser = await apiRequest("/auth/me", {
        method: "PATCH",
        body: {
          accountRecoveryOption: data.option,
        },
      })

      // Update the global auth store
      updateUserStore(updatedUser)

      toast({
        title: "Preferences saved",
        description: "Your recovery options have been successfully updated.",
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
          name="option"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormControl>
                        <RadioGroupItem value="email" />
                      </FormControl>
                      <FormLabel>Email Recovery</FormLabel>
                    </div>
                    <FormDescription>
                      Receive a password reset link or recovery instructions
                      sent to your registered email address.
                    </FormDescription>
                  </FormItem>
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormControl>
                        <RadioGroupItem value="sms" />
                      </FormControl>
                      <FormLabel>SMS Recovery</FormLabel>
                    </div>
                    <FormDescription>
                      Receive a code or recovery instructions via SMS to your
                      registered mobile phone number.
                    </FormDescription>
                  </FormItem>
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormControl>
                        <RadioGroupItem value="codes" />
                      </FormControl>
                      <FormLabel>Recovery Codes</FormLabel>
                    </div>
                    <FormDescription>
                      Use pre-generated recovery codes that you saved when
                      setting up your account to regain access.
                    </FormDescription>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
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
