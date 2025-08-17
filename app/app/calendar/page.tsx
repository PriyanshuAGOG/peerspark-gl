"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Brain,
  Target,
  Zap,
  Trophy,
  Flame,
  Play,
  FileText,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { calendarService, CalendarEvent } from "@/lib/services/calendar"
import { jitsiService } from "@/lib/video-call"
import { Skeleton } from "@/components/ui/skeleton"

const eventTypes = [
  { value: "lesson", label: "Lesson", color: "bg-blue-500", icon: BookOpen },
  { value: "quiz", label: "Quiz", color: "bg-purple-500", icon: Brain },
  { value: "quest", label: "Quest", color: "bg-orange-500", icon: Target },
  { value: "study", label: "Study Session", color: "bg-green-500", icon: Clock },
  { value: "meeting", label: "Meeting", color: "bg-cyan-500", icon: Users },
  { value: "deadline", label: "Deadline", color: "bg-red-500", icon: AlertCircle },
  { value: "exam", label: "Exam", color: "bg-indigo-500", icon: FileText },
  { value: "break", label: "Break", color: "bg-yellow-500", icon: Zap },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [filterPod, setFilterPod] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    const fetchEvents = async () => {
      setIsLoading(true)
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const userEvents = await calendarService.getUserEvents(user.$id, startOfMonth.toISOString(), endOfMonth.toISOString())
      setEvents(userEvents)
      setIsLoading(false)
    }
    fetchEvents()
  }, [user, currentDate, toast])

  // Form state for creating/editing events
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    type: "study" as CalendarEvent["type"],
    location: "",
    podId: "",
    isRecurring: false,
    reminders: [15],
    isMeeting: false,
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const matchesDate =
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()

      const matchesPod = filterPod === "all" || event.podId === filterPod

      // TODO: Add status filtering
      // const matchesStatus = filterStatus === "all" || event.status === filterStatus

      return matchesDate && matchesPod
    })
  }

  const getStatusIcon = (isCompleted?: boolean) => {
    if (isCompleted) return <CheckCircle className="w-3 h-3 text-green-500" />
    return <AlertCircle className="w-3 h-3 text-yellow-500" />
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "border-l-green-500"
      case "medium":
        return "border-l-yellow-500"
      case "hard":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleCreateEvent = async () => {
    if (!user) return;

    const { startDate, startTime, endDate, endTime, isMeeting, ...rest } = formData;
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    let meetingUrl: string | undefined;
    if (isMeeting) {
        meetingUrl = jitsiService.generateMeetingUrl(`PeerSpark-Meeting-${Date.now()}`);
    }

    try {
        const newEvent = await calendarService.createEvent({
            ...rest,
            userId: user.$id,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            meetingUrl,
        });
        setEvents(prev => [...prev, newEvent]);
        setIsCreateDialogOpen(false);
        toast({ title: "Event created successfully!" });
    } catch (error) {
        toast({ title: "Failed to create event", variant: "destructive" });
    }
  }

  const handleEventAction = async (eventId: string, action: "complete") => {
    try {
        const updatedEvent = await calendarService.updateEvent(eventId, { isCompleted: true });
        setEvents(prev => prev.map(e => e.$id === eventId ? updatedEvent : e));
        toast({ title: "Event marked as complete!" });
    } catch (error) {
        toast({ title: "Failed to update event", variant: "destructive" });
    }
  }

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const todayEvents = useMemo(() => getEventsForDate(new Date()), [events, filterPod, filterStatus]);

  if (isLoading) {
      return (
        <div className="flex h-screen bg-background items-center justify-center">
            <p>Loading Calendar...</p>
        </div>
      )
  }

  return (
    <div className="flex h-screen bg-background">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                id="is-meeting"
                checked={formData.isMeeting}
                onCheckedChange={(checked) => setFormData({ ...formData, isMeeting: checked })}
                />
                <Label htmlFor="is-meeting">Make this a video meeting</Label>
            </div>
          </div>
          <Button onClick={handleCreateEvent}>Create</Button>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex flex-col">
        <div className="p-3 md:p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-xl md:text-2xl font-bold">Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Add Event</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg md:text-xl font-semibold">
                {currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-2 md:p-4 overflow-auto">
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 min-h-full">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={day} className="p-1 md:p-2 text-center font-medium text-muted-foreground border-b text-xs md:text-sm">
                  <span className="md:hidden">{day}</span>
                  <span className="hidden md:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
                </div>
              ))}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-1 md:p-2 border border-muted min-h-[80px] md:min-h-[120px]" />
                }
                const dayEvents = getEventsForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-1 md:p-2 border border-muted cursor-pointer hover:bg-muted/50 transition-colors min-h-[80px] md:min-h-[120px] ${isToday ? "bg-primary/10 border-primary" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={`text-xs md:text-sm ${isToday ? "font-bold text-primary" : ""}`}>
                      {day.getDate()}
                    </span>
                    <div className="space-y-0.5 md:space-y-1 mt-1">
                      {dayEvents.map((event) => {
                        const eventType = eventTypes.find((t) => t.value === event.type)
                        const Icon = eventType?.icon || Clock
                        return (
                          <div
                            key={event.$id}
                            className={`text-xs p-1 rounded text-white truncate ${eventType?.color || 'bg-gray-500'} border-l-2`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="w-2 h-2 flex-shrink-0" />
                              <span className="truncate flex-1">{event.title}</span>
                              {getStatusIcon(event.isCompleted)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
