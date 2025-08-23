"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, X, Clock, Trophy, BookOpen, Users, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { notificationService } from "@/lib/services/notifications"
import type { Notification } from "@/lib/services/notifications"

interface NotificationSettings {
  dailyReminders: boolean
  questNotifications: boolean
  achievementAlerts: boolean
  podUpdates: boolean
  streakWarnings: boolean
  reminderTime: string
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("notifications")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminders: true,
    questNotifications: true,
    achievementAlerts: true,
    podUpdates: true,
    streakWarnings: true,
    reminderTime: "09:00",
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
  })

  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
        setIsLoading(true)
        const userNotifications = await notificationService.getUserNotifications(user.$id)
        setNotifications(userNotifications)
        setIsLoading(false)
    }
    if (isOpen) {
        fetchNotifications()
    }
  }, [isOpen, user])


  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "pod_join":
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.$id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = async () => {
    if (!user) return
    await notificationService.markAllAsRead(user.$id)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    // TODO: Implement delete notification
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-background border rounded-lg shadow-lg z-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notifications">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="notifications" className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Recent Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>

              <ScrollArea className="h-96">
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Card
                        key={notification.$id}
                        className={`mb-2 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : ""
                        }`}
                        onClick={() => markAsRead(notification.$id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.$id)
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              {notification.actionUrl && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto mt-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = notification.actionUrl!
                                  }}
                                >
                                  {notification.actionText || "Take Action →"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="p-0">
              <ScrollArea className="h-96">
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="daily-reminders">Daily Reminders</Label>
                          <p className="text-sm text-muted-foreground">Get reminded about daily tasks and quests</p>
                        </div>
                        <Switch
                          id="daily-reminders"
                          checked={settings.dailyReminders}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, dailyReminders: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="quest-notifications">Quest Notifications</Label>
                          <p className="text-sm text-muted-foreground">New quests and challenges available</p>
                        </div>
                        <Switch
                          id="quest-notifications"
                          checked={settings.questNotifications}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, questNotifications: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                          <p className="text-sm text-muted-foreground">Celebrate your accomplishments</p>
                        </div>
                        <Switch
                          id="achievement-alerts"
                          checked={settings.achievementAlerts}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, achievementAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pod-updates">Pod Updates</Label>
                          <p className="text-sm text-muted-foreground">Activity from your learning pods</p>
                        </div>
                        <Switch
                          id="pod-updates"
                          checked={settings.podUpdates}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, podUpdates: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="streak-warnings">Streak Warnings</Label>
                          <p className="text-sm text-muted-foreground">Don't break your learning streak</p>
                        </div>
                        <Switch
                          id="streak-warnings"
                          checked={settings.streakWarnings}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, streakWarnings: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Timing Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                        <Select
                          value={settings.reminderTime}
                          onValueChange={(value) => setSettings((prev) => ({ ...prev, reminderTime: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="19:00">7:00 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="quiet-hours">Quiet Hours</Label>
                          <Switch
                            id="quiet-hours"
                            checked={settings.quietHours.enabled}
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, enabled: checked },
                              }))
                            }
                          />
                        </div>
                        {settings.quietHours.enabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm">From</Label>
                              <Select
                                value={settings.quietHours.start}
                                onValueChange={(value) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    quietHours: { ...prev.quietHours, start: value },
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="20:00">8:00 PM</SelectItem>
                                  <SelectItem value="21:00">9:00 PM</SelectItem>
                                  <SelectItem value="22:00">10:00 PM</SelectItem>
                                  <SelectItem value="23:00">11:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">To</Label>
                              <Select
                                value={settings.quietHours.end}
                                onValueChange={(value) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    quietHours: { ...prev.quietHours, end: value },
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="06:00">6:00 AM</SelectItem>
                                  <SelectItem value="07:00">7:00 AM</SelectItem>
                                  <SelectItem value="08:00">8:00 AM</SelectItem>
                                  <SelectItem value="09:00">9:00 AM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Save Settings</Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
