import { formatDateWithTime } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RecentLogsTableProps {
  sessions: any[]
  isLoading?: boolean
}

export function RecentLogsTable({ sessions, isLoading }: RecentLogsTableProps) {
  if (isLoading) {
    return <div className="py-4 text-center">Loading activity...</div>
  }

  if (sessions.length === 0) {
    return <div className="py-4 text-center">No recent activity found.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User Agent</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Expires At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="max-w-[300px] truncate">
              {session.userAgent || "Unknown"}
            </TableCell>
            <TableCell>{session.ip || "Unknown"}</TableCell>
            <TableCell>{formatDateWithTime(session.createdAt)}</TableCell>
            <TableCell>{formatDateWithTime(session.expiresAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
