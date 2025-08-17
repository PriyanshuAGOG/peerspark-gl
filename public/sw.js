const CACHE_NAME = "peerspark-v1"
const urlsToCache = [
  "/",
  "/app",
  "/app/feed",
  "/app/chat",
  "/app/pods",
  "/app/calendar",
  "/app/vault",
  "/placeholder-icon.png",
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

self.addEventListener("push", (event) => {
  const defaultOptions = {
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
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
    requireInteraction: true,
    silent: false,
  }

  let options = { ...defaultOptions }

  if (event.data) {
    const payload = event.data.json()
    options = {
      ...defaultOptions,
      body: payload.message || payload.body || defaultOptions.body,
      title: payload.title || "PeerSpark",
      icon: payload.icon || defaultOptions.icon,
      data: { ...defaultOptions.data, ...payload.data },
      tag: payload.type || "general",
    }

    // Customize based on notification type
    switch (payload.type) {
      case "reminder":
        options.actions = [
          { action: "complete", title: "Complete Task", icon: "/icons/check.png" },
          { action: "snooze", title: "Snooze 1h", icon: "/icons/snooze.png" },
        ]
        options.vibrate = [200, 100, 200]
        break
      case "achievement":
        options.actions = [
          { action: "view", title: "View Achievement", icon: "/icons/trophy.png" },
          { action: "share", title: "Share", icon: "/icons/share.png" },
        ]
        options.vibrate = [100, 50, 100, 50, 100]
        break
      case "quest_available":
        options.actions = [
          { action: "start", title: "Start Quest", icon: "/icons/play.png" },
          { action: "later", title: "Remind Later", icon: "/icons/clock.png" },
        ]
        break
      case "streak_warning":
        options.actions = [
          { action: "complete", title: "Complete Now", icon: "/icons/fire.png" },
          { action: "dismiss", title: "Dismiss", icon: "/icons/dismiss.png" },
        ]
        options.requireInteraction = true
        options.vibrate = [300, 100, 300]
        break
    }
  }

  event.waitUntil(self.registration.showNotification(options.title || "PeerSpark", options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const action = event.action

  let targetUrl = "/app"

  // Handle different actions based on notification type
  switch (action) {
    case "view":
      targetUrl = notificationData.actionUrl || "/app"
      break
    case "complete":
      targetUrl = "/app/calendar"
      // Send completion event to server
      event.waitUntil(
        fetch("/api/notifications/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notificationData.primaryKey }),
        }),
      )
      break
    case "start":
      targetUrl = notificationData.actionUrl || "/app/pods"
      break
    case "snooze":
      // Schedule snooze notification
      event.waitUntil(
        fetch("/api/notifications/snooze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationId: notificationData.primaryKey,
            snoozeMinutes: 60,
          }),
        }),
      )
      return
    case "share":
      targetUrl = "/app/profile"
      break
    case "later":
      // Remind in 2 hours
      event.waitUntil(
        fetch("/api/notifications/remind-later", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationId: notificationData.primaryKey,
            remindMinutes: 120,
          }),
        }),
      )
      return
    case "dismiss":
      return
    default:
      targetUrl = notificationData.actionUrl || "/app"
  }

  // Open or focus the target URL
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if the target URL is already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus()
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }),
  )
})

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  return fetch("/api/sync")
    .then((response) => response.json())
    .then((data) => {
      console.log("Background sync completed:", data)
    })
    .catch((error) => {
      console.error("Background sync failed:", error)
    })
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-quest-check") {
    event.waitUntil(checkDailyQuests())
  }
})

function checkDailyQuests() {
  return fetch("/api/quests/daily-check")
    .then((response) => response.json())
    .then((data) => {
      if (data.hasIncompleteQuests) {
        return self.registration.showNotification("Daily Quest Reminder", {
          body: "You have incomplete daily quests. Complete them to maintain your streak!",
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: "daily-quest-reminder",
          actions: [
            { action: "complete", title: "Complete Now", icon: "/icons/check.png" },
            { action: "dismiss", title: "Later", icon: "/icons/dismiss.png" },
          ],
          data: { actionUrl: "/app/calendar" },
        })
      }
    })
    .catch((error) => {
      console.error("Daily quest check failed:", error)
    })
}
