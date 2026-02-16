import { Lato, Noto_Sans_Devanagari } from "next/font/google"

import { i18n } from "@/configs/i18n"
import { cn } from "@/lib/utils"

import "../globals.css"

import { Providers } from "@/providers"

import type { LocaleType } from "@/types"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"

// Define metadata for the application
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
const appBaseUrl =
  process.env.BASE_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    template: "%s | Shadboard",
    default: "Shadboard",
  },
  description: "",
  // Guard against invalid URLs in development to avoid runtime crashes.
  metadataBase: new URL(appBaseUrl),
}

// Define fonts for the application
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
const latoFont = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-lato",
})
const hindiFont = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  style: ["normal"],
  variable: "--font-hindi",
})

export default async function RootLayout(props: {
  children: ReactNode
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params

  const { children } = props

  const direction = i18n.localeDirection[params.lang]

  return (
    <html lang={params.lang} dir={direction} suppressHydrationWarning>
      <body
        className={cn(
          "[&:lang(en)]:font-lato [&:lang(hi)]:font-hindi", // Set font styles based on the language
          "bg-background text-foreground antialiased overscroll-none", // Set background, text, , anti-aliasing styles, and overscroll behavior
          latoFont.variable, // Include Lato font variable
          hindiFont.variable // Include Hindi font variable
        )}
      >
        <Providers locale={params.lang} direction={direction}>
          {children}
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  )
}
