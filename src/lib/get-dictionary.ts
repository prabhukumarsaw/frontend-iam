// More info: https://nextjs.org/docs/app/building-your-application/routing/internationalization#localization
import "server-only"

import type { LocaleType } from "@/types"
import enDictionary from "@/data/dictionaries/en.json"
import hiDictionary from "@/data/dictionaries/hi.json"

const dictionaries = {
  en: enDictionary,
  hi: hiDictionary,
} as const

export async function getDictionary(locale: LocaleType) {
  return dictionaries[locale]
}

export type DictionaryType = Awaited<ReturnType<typeof getDictionary>>
