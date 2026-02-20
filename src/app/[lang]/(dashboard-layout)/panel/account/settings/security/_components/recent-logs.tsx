import Link from "next/link"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RecentLogsTable } from "./recent-logs-table"

interface RecentLogsProps {
  sessions: any[]
  isLoading?: boolean
}

export function RecentLogs({ sessions, isLoading }: RecentLogsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Logs</CardTitle>
        <CardDescription>
          View your latest account activity and sign-in history to ensure your
          account security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecentLogsTable sessions={sessions} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
