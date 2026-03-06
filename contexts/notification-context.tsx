"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface Notification {
  id: string
  type?: "success" | "error" | "warning" | "info"
  title?: string
  message?: string
  duration?: number
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  notificationHistory: Notification[]
  unreadCount: number
  addNotification: {
    (notification: Omit<Notification, "id" | "timestamp" | "read">): void;
    (message: string, type: "success" | "error" | "warning" | "info"): void;
  }
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearHistory: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = "notification_history"

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotificationHistory(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })),
        )
      } catch (e) {
        console.error("Failed to load notification history", e)
      }
    }
  }, [])

  useEffect(() => {
    if (notificationHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationHistory))
    }
  }, [notificationHistory])

  const unreadCount = notificationHistory.filter((n) => !n.read).length
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])
  const addNotification = useCallback((
  notificationOrMessage: string | Omit<Notification, "id" | "timestamp" | "read">,
  type?: "success" | "error" | "warning" | "info"
) => {
  let notificationData: Omit<Notification, "id" | "timestamp" | "read">;
  
  // Vérifier si c'est appelé avec (message, type) ou avec un objet
  if (typeof notificationOrMessage === "string" && type) {
    // Syntaxe: addNotification(message, type)
    notificationData = {
      type,
      title: type === "error" ? "Erreur" : 
             type === "success" ? "Succès" : 
             type === "warning" ? "Attention" : "Information",
      message: notificationOrMessage,
      duration: 5000 // durée par défaut
    };
  } else if (typeof notificationOrMessage === "object") {
    // Syntaxe: addNotification({ type, title, message, duration })
    notificationData = notificationOrMessage;
  } else {
    throw new Error("Arguments invalides pour addNotification");
  }

  const id = Date.now().toString() + Math.random().toString(36)
  const newNotification: Notification = {
    ...notificationData,
    id,
    timestamp: new Date(),
    read: false,
    duration: notificationData.duration ?? 5000,
  }

  setNotifications((prev) => [...prev, newNotification])

  setNotificationHistory((prev) => [newNotification, ...prev].slice(0, 100))

  // Auto remove from toast after duration
  if (newNotification.duration) {
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }
}, [removeNotification]) // Ajout de removeNotification dans les dépendances



  const markAsRead = useCallback((id: string) => {
    setNotificationHistory((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotificationHistory((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearHistory = useCallback(() => {
    setNotificationHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationHistory,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearHistory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
