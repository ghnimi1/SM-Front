"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { NotificationContainer } from "@/components/notification-container"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NotificationProvider>
      <AuthProvider>
        {children}
        <NotificationContainer />
      </AuthProvider>
    </NotificationProvider>
  )
}
