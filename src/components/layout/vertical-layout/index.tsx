import type { DictionaryType } from "@/lib/get-dictionary"
import type { ReactNode } from "react"

import { Footer } from "../footer"
import { Sidebar } from "../sidebar"
import { SidebarPrimary } from "../sidebar-primary"
import { VerticalLayoutHeader } from "./vertical-layout-header"
import { useParams } from "next/navigation"
import type { LocaleType } from "@/types"

export function VerticalLayout({
  children,
  dictionary,
}: {
  children: ReactNode
  dictionary: DictionaryType
}) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <div className="flex h-svh w-full bg-background overflow-hidden">
      {/* Primary Rail - persistent on desktop */}
      <div className="hidden md:block">
        <SidebarPrimary dictionary={dictionary} locale={locale} />
      </div>

      {/* Main Container - Header stays top, Sidebar and Content below */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-16">
        <VerticalLayoutHeader dictionary={dictionary} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar dictionary={dictionary} />
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-muted/20">
            <main className="flex-1 pb-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
