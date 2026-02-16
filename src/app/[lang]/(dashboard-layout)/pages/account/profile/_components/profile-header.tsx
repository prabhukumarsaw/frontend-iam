"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageSquare, MoreHorizontal, UserPen, UserPlus } from "lucide-react"

import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn, formatNumberToCompact, getInitials } from "@/lib/utils"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { getAbsoluteUrl } from "@/lib/api/client"

export function ProfileHeader({ locale }: { locale: LocaleType }) {
  const user = useAuthStore((state) => state.user)

  const name = user?.name ?? user?.email ?? "User"
  const avatar = (user as { avatar?: string | null } | null)?.avatar ?? undefined
  const state = (user as { state?: string } | null)?.state
  const country = (user as { country?: string } | null)?.country
  const followers = (user as { followers?: number } | null)?.followers ?? 0
  const connections = (user as { connections?: number } | null)?.connections ?? 0
  const background = (user as { background?: string } | null)?.background

  return (
    <section className="bg-background border-b border-border">
      <div className="relative">
        <AspectRatio ratio={6 / 1} className="bg-muted overflow-hidden">
          {background ? (
            <Image
              src={background}
              fill
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              alt="Profile Background"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
          )}
        </AspectRatio>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative flex flex-col gap-6 pb-6 pt-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
            <Avatar className="size-32 -mt-16 ring-4 ring-background md:size-40 md:-mt-20">
              <AvatarImage
                src={getAbsoluteUrl(avatar)}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center text-center md:items-start md:pb-1 md:text-start">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {name}
              </h1>
              <p className="mt-1 text-muted-foreground font-medium">
                {state && `${state}, `}
                {country || "Planet Earth"}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
                <div className="flex gap-1 hover:text-primary cursor-pointer transition-colors">
                  <span className="text-foreground">{formatNumberToCompact(followers)}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex gap-1 hover:text-primary cursor-pointer transition-colors">
                  <span className="text-foreground">{formatNumberToCompact(connections)}</span>
                  <span className="text-muted-foreground">Connections</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:pb-1 lg:gap-3">
            <Button variant="default" className="gap-2 rounded-full px-6 shadow-sm shadow-primary/20">
              <UserPlus className="size-4" />
              Follow
            </Button>
            <Button variant="outline" className="gap-2 rounded-full px-6 bg-background/50 backdrop-blur-sm">
              <MessageSquare className="size-4" />
              Message
            </Button>
            <Link
              href={ensureLocalizedPathname("/pages/account/settings", locale)}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "rounded-full bg-background/50 backdrop-blur-sm"
              )}
              aria-label="Edit Profile"
            >
              <UserPen className="size-4" />
            </Link>
            <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
