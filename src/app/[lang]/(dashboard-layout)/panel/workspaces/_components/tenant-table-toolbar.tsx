"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TenantTableToolbarProps<TData> {
    table: Table<TData>
}

export function TenantTableToolbar<TData>({
    table,
}: TenantTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    placeholder="Search name..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-10"
                />
                <Input
                    placeholder="Filter by slug..."
                    value={(table.getColumn("slug")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("slug")?.setFilterValue(event.target.value)
                    }
                    className="h-10"
                />
                <Input
                    placeholder="Filter by domain..."
                    value={(table.getColumn("domain")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("domain")?.setFilterValue(event.target.value)
                    }
                    className="h-10"
                />
                <Select
                    value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) => {
                        if (value === "all") {
                            table.getColumn("isActive")?.setFilterValue(undefined)
                        } else {
                            table.getColumn("isActive")?.setFilterValue(value === "active")
                        }
                    }}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 lg:px-3"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
                {/* 
                Wrap DataTableViewOptions to handle missing component if necessary
                Assuming it exists as referenced in generic ui components, 
                but invoice-table-toolbar uses a local wrapper.
                For now I'll skip ViewOptions or use a generic one if available.
                The invoice toolbar used `InvoiceTableViewOptions`.
                I will skip it for now to avoid dependency issues or use generic if I find it.
             */}
            </div>
        </div>
    )
}
