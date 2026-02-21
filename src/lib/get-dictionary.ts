// More info: https://nextjs.org/docs/app/building-your-application/routing/internationalization#localization
import "server-only"

import type { LocaleType } from "@/types"
const dictionaries = {
  en: () => import("@/data/dictionaries/en.json").then((module) => module.default),
  hi: () => import("@/data/dictionaries/hi.json").then((module) => module.default),
}

export async function getDictionary(locale: LocaleType) {
  return (dictionaries[locale as keyof typeof dictionaries] || dictionaries.en)()
}

export type DictionaryType = Awaited<ReturnType<typeof getDictionary>>
