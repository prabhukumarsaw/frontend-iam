"use client"

import { use } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { ChatBox } from "../_components/chat-box"
import { ChatBoxPlaceholder } from "../_components/chat-box-placeholder"

export default function ChatBoxPage(props: {
  params: Promise<{ id: string[] }>
}) {
  const params = use(props.params)
  const user = useAuthStore((state) => state.user)
  const chatIdParam = params.id?.[0]

  // If no chat is selected, show a placeholder UI
  if (!chatIdParam) return <ChatBoxPlaceholder />

  if (!user) {
    return null
  }

  // Otherwize show a chat box
  return <ChatBox user={user as any} />
}
