"use client"

import { Edit, MoreHorizontal, Trash, Copy, Eye } from "lucide-react"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TenantTableRowActionsProps<TData> {
    row: Row<TData>
    onEdit: (data: TData) => void
    onView: (data: TData) => void
}

export function TenantTableRowActions<TData>({
    row,
    onEdit,
    onView,
}: TenantTableRowActionsProps<TData>) {
    const tenant = row.original

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => onView(tenant)}>
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(tenant)}>
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText((tenant as any).id)}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <Trash className="mr-2 h-3.5 w-3.5" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
