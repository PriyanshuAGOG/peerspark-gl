interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || ""

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported")
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered successfully")

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      return true
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error("Service Worker not registered")
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey),
      })

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })

      return subscription
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      return null
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()

        // Notify server
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      }
      return true
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error)
      return false
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    const permission = await this.requestPermission()
    if (permission !== "granted") {
      console.warn("Notification permission not granted")
      return
    }

    if (this.registration) {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/placeholder-icon.png",
        badge: payload.badge || "/placeholder-icon.png",
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: true,
        vibrate: [200, 100, 200],
      })
    } else {
      // Fallback to browser notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/placeholder-icon.png",
        tag: payload.tag,
        data: payload.data,
      })
    }
  }

  // Predefined notification templates
  async notifyNewMessage(senderName: string, message: string, chatId: string): Promise<void> {
    await this.showNotification({
      title: `New message from ${senderName}`,
      body: message,
      icon: "/placeholder.svg?height=64&width=64&text=💬",
      tag: `message-${chatId}`,
      data: { type: "message", chatId },
      actions: [
        { action: "reply", title: "Reply" },
        { action: "view", title: "View Chat" },
      ],
    })
  }

  async notifySessionStarting(podName: string, podId: string): Promise<void> {
    await this.showNotification({
      title: "Live Session Starting",
      body: `${podName} session is about to begin`,
      icon: "/placeholder.svg?height=64&width=64&text=🎥",
      tag: `session-${podId}`,
      data: { type: "session", podId },
      actions: [
        { action: "join", title: "Join Now" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  }

  async notifyNewResource(resourceTitle: string, podName: string, podId: string): Promise<void> {
    await this.showNotification({
      title: "New Resource Available",
      body: `${resourceTitle} has been added to ${podName}`,
      icon: "/placeholder.svg?height=64&width=64&text=📚",
      tag: `resource-${podId}`,
      data: { type: "resource", podId },
      actions: [
        { action: "view", title: "View Resource" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  }

  async notifyMentioned(mentionerName: string, content: string, chatId: string): Promise<void> {
    await this.showNotification({
      title: `${mentionerName} mentioned you`,
      body: content,
      icon: "/placeholder.svg?height=64&width=64&text=@",
      tag: `mention-${chatId}`,
      data: { type: "mention", chatId },
      actions: [
        { action: "reply", title: "Reply" },
        { action: "view", title: "View" },
      ],
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

export const notificationManager = new NotificationManager()
export type { NotificationPayload, NotificationAction }
