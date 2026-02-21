"use client"

import { Table } from "@tanstack/react-table"
import { Search as SearchIcon, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-column-toggle"

interface RoleTableToolbarProps<TData> {
    table: Table<TData>
    search: string
    onSearchChange: (value: string) => void
    onRefresh: () => void
    isLoading?: boolean
}

export function RoleTableToolbar<TData>({
    table,
    search,
    onSearchChange,
    onRefresh,
    isLoading
}: RoleTableToolbarProps<TData>) {
    const isFiltered = search.length > 0

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-muted/20 bg-card/60 backdrop-blur-sm shadow-sm transition-all">
            <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80 group">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors opacity-50" />
                    <Input
                        placeholder="Search archetypes..."
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="h-9 pl-9 pr-9 bg-muted/20 border-muted/30 focus:bg-background transition-all rounded-lg text-[11px] font-bold placeholder:font-medium placeholder:text-muted-foreground/50 shadow-inner"
                    />
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => onSearchChange("")}
                            className="h-6 w-6 p-0 absolute right-1.5 top-1/2 -translate-y-1/2 hover:bg-muted/60 text-muted-foreground/60 rounded-md"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-9 w-9 p-0 rounded-lg border-muted/30 hover:bg-background hover:text-primary transition-all active:scale-95 duration-200"
                >
                    <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground transition-all", isLoading && "animate-spin text-primary")} />
                </Button>
                <div className="h-5 w-[1px] bg-muted/20 mx-1 hidden sm:block" />
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}

import { cn } from "@/lib/utils"
