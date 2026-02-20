"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { ChangeEvent } from "react"
import type { ProfileInfoFormType, UserType } from "../../../types"

import { ProfileInfoSchema } from "../../_schemas/profile-info-form-schema"

import { cn, getInitials } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, ButtonLoading, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputPhone } from "@/components/ui/input-phone"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/stores/auth-store"
import { updateProfile } from "@/lib/api/auth"
import { uploadFile } from "@/lib/api/files"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { getAbsoluteUrl } from "@/lib/api/client"
import { useParams, useRouter } from "next/navigation"

export function ProfileInfoForm({ user }: { user: UserType }) {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string
  const updateUserStore = useAuthStore((state) => state.updateUser)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    getAbsoluteUrl(user?.avatar)
  )

  const form = useForm<ProfileInfoFormType>({
    resolver: zodResolver(ProfileInfoSchema),
    values: {
      ...user,
      avatar: undefined,
    },
  })

  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  async function onSubmit(data: ProfileInfoFormType) {
    try {
      // Map frontend fields to backend schema
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        phone: data.phoneNumber,
        state: data.state,
        country: data.country,
        address: data.address,
        zipCode: data.zipCode,
        locale: data.language,
        timezone: data.timeZone,
        currency: data.currency,
        organization: data.organization,
      }

      // Handle avatar if provided (as a file)
      if (data.avatar instanceof File) {
        toast({
          title: "Uploading Image...",
          description: "Please wait while we upload your profile picture.",
        })
        const fileRes = await uploadFile(data.avatar, true)
        updateData.avatar = fileRes.url
      }

      const updatedUser = await updateProfile(updateData)

      // Update the global auth store
      updateUserStore(updatedUser)

      const profileUrl = `/${lang}/pages/account/profile`

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully saved.",
        action: (
          <ToastAction
            altText="View Profile"
            onClick={() => router.push(profileUrl)}
          >
            View Profile
          </ToastAction>
        ),
      })

      form.reset(data) // Mark form as pristine with new data

      // Redirect after a short delay for better UX
      setTimeout(() => {
        router.push(profileUrl)
      }, 1500)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      })
    }
  }

  // Sync photoPreview when user prop changes (e.g. after update or initial load if hydration differs)
  useEffect(() => {
    setPhotoPreview(getAbsoluteUrl(user?.avatar))
  }, [user?.avatar])

  function handleResetForm() {
    form.reset() // Reset the form to the initial state
    setPhotoPreview(getAbsoluteUrl(user?.avatar)) // Reset photoPreview to the initial state with absolute URL
  }

  function handleUploadPhoto(e: ChangeEvent<HTMLInputElement>) {
    // Get the selected file from the file input
    const file = e.target.files?.[0]

    if (file) {
      // Generate a temporary URL for the uploaded image for preview purposes
      const imageUrl = URL.createObjectURL(file)

      setPhotoPreview(imageUrl)
      form.setValue("avatar", file)
      form.trigger("avatar") // Trigger validation for the "avatar" field
    }
  }

  function handleRemovePhoto() {
    form.setValue("avatar", null as any, { shouldDirty: true })
    setPhotoPreview(undefined)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-3">
        <div className="flex items-center gap-x-4">
          <Avatar className="size-22">
            <AvatarImage src={photoPreview} alt="Profile Avatar" />
            <AvatarFallback>
              {getInitials(
                user.name ||
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                user.username ||
                user.email
              )}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="avatar"
              render={() => (
                <FormItem>
                  <FormLabel
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "cursor-pointer w-full"
                    )}
                  >
                    Upload Photo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadPhoto}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemovePhoto}
            >
              Remove Photo
            </Button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="grow">
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
              <FormItem className="grow">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <InputPhone placeholder="+12133734253" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Alabama",
                      "Alaska",
                      "Arizona",
                      "Arkansas",
                      "California",
                      "Colorado",
                      "Connecticut",
                      "Delaware",
                      "Florida",
                      "Georgia",
                      "Hawaii",
                      "Idaho",
                      "Illinois",
                      "Indiana",
                      "Iowa",
                      "Kansas",
                      "Kentucky",
                      "Louisiana",
                      "Maine",
                      "Maryland",
                      "Massachusetts",
                      "Michigan",
                      "Minnesota",
                      "Mississippi",
                      "Missouri",
                      "Montana",
                      "Nebraska",
                      "Nevada",
                      "New Hampshire",
                      "New Jersey",
                      "New Mexico",
                      "New York",
                      "North Carolina",
                      "North Dakota",
                      "Ohio",
                      "Oklahoma",
                      "Oregon",
                      "Pennsylvania",
                      "Rhode Island",
                      "South Carolina",
                      "South Dakota",
                      "Tennessee",
                      "Texas",
                      "Utah",
                      "Vermont",
                      "Virginia",
                      "Washington",
                      "West Virginia",
                      "Wisconsin",
                      "Wyoming",
                    ].map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "United States",
                      "Canada",
                      "United Kingdom",
                      "Australia",
                      "Germany",
                      "France",
                      "Japan",
                      "China",
                      "India",
                      "Brazil",
                    ].map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="90210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "English",
                      "Spanish",
                      "French",
                      "German",
                      "Chinese",
                      "Japanese",
                      "Hindi",
                      "portuguese",
                      "Russian",
                    ].map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "GMT-12:00",
                      "GMT-11:00",
                      "GMT-10:00",
                      "GMT-09:00",
                      "GMT-08:00",
                      "GMT-07:00",
                      "GMT-06:00",
                      "GMT-05:00",
                      "GMT-04:00",
                      "GMT-03:00",
                      "GMT-02:00",
                      "GMT-01:00",
                      "GMT+00:00",
                      "GMT+01:00",
                      "GMT+02:00",
                      "GMT+03:00",
                      "GMT+04:00",
                      "GMT+05:00",
                      "GMT+06:00",
                      "GMT+07:00",
                      "GMT+08:00",
                      "GMT+09:00",
                      "GMT+10:00",
                      "GMT+11:00",
                      "GMT+12:00",
                    ].map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "USD",
                      "EUR",
                      "GBP",
                      "JPY",
                      "CAD",
                      "AUD",
                      "CHF",
                      "CNY",
                      "INR",
                      "BRL",
                    ].map((currency) => (
                      <SelectItem key={currency} value={currency.split(" ")[0]}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization (Optional)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Company Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-x-2 mt-2">
          <ButtonLoading
            isLoading={isSubmitting}
            className="w-fit"
            disabled={isDisabled}
          >
            Save
          </ButtonLoading>
          <Button
            type="reset"
            variant="secondary"
            className="w-fit"
            disabled={isDisabled}
            onClick={handleResetForm}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
