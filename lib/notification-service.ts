interface NotificationPayload {
  title: string
  message: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

class NotificationService {
  private static instance: NotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async initialize() {
    if ("serviceWorker" in navigator && "Notification" in window) {
      try {
        this.registration = await navigator.serviceWorker.register("/sw.js")
        console.log("[v0] Service Worker registered successfully")
      } catch (error) {
        console.error("[v0] Service Worker registration failed:", error)
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("[v0] This browser does not support notifications")
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

  async showNotification(payload: NotificationPayload) {
    const permission = await this.requestPermission()

    if (permission !== "granted") {
      console.warn("[v0] Notification permission not granted")
      return
    }

    const options: NotificationOptions = {
      body: payload.message,
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/badge-72x72.png",
      tag: payload.tag,
      data: payload.data,
      requireInteraction: true,
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/icons/view.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/icons/dismiss.png",
        },
      ],
    }

    if (this.registration) {
      await this.registration.showNotification(payload.title, options)
    } else {
      new Notification(payload.title, options)
    }
  }

  async scheduleNotification(payload: NotificationPayload, delay: number) {
    setTimeout(() => {
      this.showNotification(payload)
    }, delay)
  }

  async scheduleDailyReminder(time: string, payload: NotificationPayload) {
    const now = new Date()
    const [hours, minutes] = time.split(":").map(Number)

    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const delay = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.showNotification(payload)
      // Reschedule for next day
      this.scheduleDailyReminder(time, payload)
    }, delay)
  }
}

export const notificationService = NotificationService.getInstance()
