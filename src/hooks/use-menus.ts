"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { apiRequest } from "@/lib/api/client"
import { ensureLocalizedPathname } from "@/lib/i18n"
import type { DynamicIconNameType, NavigationType, LocaleType } from "@/types"

export interface ApiMenuItem {
    id: string
    parentId: string | null
    title: string
    path: string | null
    icon: string | null
    order: number
    permissionCode: string | null
    isActive: boolean
}

export function useMenus() {
    const [menus, setMenus] = useState<ApiMenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const locale = (params.lang as LocaleType) || "en"

    async function fetchMenus() {
        try {
            setLoading(true)
            const res = await apiRequest("/menus/me")
            setMenus(res.data?.menus || [])
        } catch (error) {
            console.error("[useMenus] Failed to fetch menus", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMenus()
    }, [])

    const navigationData: NavigationType[] = useMemo(() => {
        const buildTree = (menusList: ApiMenuItem[], parentId: string | null): any[] => {
            return menusList
                .filter((m) => m.parentId === parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((m) => {
                    const children = buildTree(menusList, m.id)
                    const localizedPath = m.path ? ensureLocalizedPathname(m.path, locale) : undefined
                    const item: any = {
                        title: m.title,
                        iconName: m.icon as DynamicIconNameType,
                        href: localizedPath,
                    }
                    if (children.length > 0) {
                        item.items = children
                    }
                    return item
                })
        }

        const rootItems = menus
            .filter((m) => !m.parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

        return rootItems.map((root) => {
            const localizedPath = root.path ? ensureLocalizedPathname(root.path, locale) : undefined
            return {
                title: root.title,
                iconName: root.icon as DynamicIconNameType,
                href: localizedPath,
                items: buildTree(menus, root.id),
            }
        })
    }, [menus, locale])

    return {
        navigationData,
        loading,
        refresh: fetchMenus,
    }
}
