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
    <div className="flex h-svh w-full bg-background overflow-hidden relative">
      {/* Primary Rail - Persistent on desktop */}
      <div className="hidden md:block shrink-0">
        <SidebarPrimary dictionary={dictionary} locale={locale} />
      </div>

      {/* Main Container - Header stays top, Sidebar and Content below */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-16 relative">
        <VerticalLayoutHeader dictionary={dictionary} />
        
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar dictionary={dictionary} />
          
          {/* Content Area - Premium glass look */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-muted/30 dark:bg-muted/10 transition-colors duration-300">
            <main className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}

