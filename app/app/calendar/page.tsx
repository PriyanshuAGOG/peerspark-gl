"use client"

import { useState, useEffect } from "react"
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

interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  type: "study" | "meeting" | "deadline" | "exam" | "break" | "quest" | "quiz" | "lesson"
  podId?: string
  podName?: string
  location?: string
  meetingUrl?: string
  attendees: string[]
  isRecurring: boolean
  reminders: number[]
  color: string
  status?: "completed" | "missed" | "pending" | "in-progress"
  difficulty?: "easy" | "medium" | "hard"
  points?: number
  resources?: string[]
}

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

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Binary Trees Fundamentals",
    description: "Learn about binary tree traversal algorithms and implementation",
    startTime: new Date(2024, 11, 15, 9, 0),
    endTime: new Date(2024, 11, 15, 10, 30),
    type: "lesson",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: ["user1", "user2", "user3"],
    isRecurring: false,
    reminders: [15],
    color: "bg-blue-500",
    status: "completed",
    points: 50,
    resources: ["Binary Trees Guide.pdf", "Practice Problems"],
  },
  {
    id: "2",
    title: "Tree Traversal Quiz",
    description: "Test your knowledge of inorder, preorder, and postorder traversal",
    startTime: new Date(2024, 11, 15, 14, 0),
    endTime: new Date(2024, 11, 15, 14, 30),
    type: "quiz",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: [],
    isRecurring: false,
    reminders: [15],
    color: "bg-purple-500",
    status: "completed",
    difficulty: "medium",
    points: 75,
  },
  {
    id: "3",
    title: "Implement Binary Search Tree",
    description: "Build a complete BST with insert, delete, and search operations",
    startTime: new Date(2024, 11, 15, 16, 0),
    endTime: new Date(2024, 11, 15, 18, 0),
    type: "quest",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: [],
    isRecurring: false,
    reminders: [30],
    color: "bg-orange-500",
    status: "in-progress",
    difficulty: "hard",
    points: 100,
  },
  {
    id: "4",
    title: "Graph Algorithms Introduction",
    description: "Understanding BFS and DFS algorithms with practical examples",
    startTime: new Date(2024, 11, 16, 9, 0),
    endTime: new Date(2024, 11, 16, 10, 30),
    type: "lesson",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: ["user1", "user2", "user3"],
    isRecurring: false,
    reminders: [15],
    color: "bg-blue-500",
    status: "pending",
    points: 60,
  },
  {
    id: "5",
    title: "Graph Traversal Challenge",
    description: "Solve 5 graph problems using BFS and DFS",
    startTime: new Date(2024, 11, 16, 14, 0),
    endTime: new Date(2024, 11, 16, 15, 0),
    type: "quiz",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: [],
    isRecurring: false,
    reminders: [15],
    color: "bg-purple-500",
    status: "pending",
    difficulty: "hard",
    points: 90,
  },
  {
    id: "6",
    title: "Build Social Network Graph",
    description: "Create a social network representation using adjacency lists",
    startTime: new Date(2024, 11, 16, 16, 0),
    endTime: new Date(2024, 11, 16, 18, 30),
    type: "quest",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: [],
    isRecurring: false,
    reminders: [30],
    color: "bg-orange-500",
    status: "pending",
    difficulty: "hard",
    points: 120,
  },
  {
    id: "7",
    title: "Dynamic Programming Basics",
    description: "Introduction to memoization and tabulation techniques",
    startTime: new Date(2024, 11, 17, 9, 0),
    endTime: new Date(2024, 11, 17, 10, 30),
    type: "lesson",
    podId: "dsa-masters",
    podName: "DSA Masters",
    attendees: ["user1", "user2", "user3"],
    isRecurring: false,
    reminders: [15],
    color: "bg-blue-500",
    status: "missed",
    points: 55,
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
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

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Check for pod filter from URL params
  useEffect(() => {
    const podParam = searchParams.get("pod")
    if (podParam) {
      setFilterPod(podParam)
    }
  }, [searchParams])

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
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
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
      const matchesStatus = filterStatus === "all" || event.status === filterStatus

      return matchesDate && matchesPod && matchesStatus
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "missed":
        return <XCircle className="w-3 h-3 text-red-500" />
      case "in-progress":
        return <Play className="w-3 h-3 text-blue-500" />
      case "pending":
      default:
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
    }
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

  const handleCreateEvent = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEventAction = (eventId: string, action: "start" | "complete" | "skip") => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          let newStatus: CalendarEvent["status"]
          switch (action) {
            case "start":
              newStatus = "in-progress"
              break
            case "complete":
              newStatus = "completed"
              break
            case "skip":
              newStatus = "missed"
              break
            default:
              newStatus = event.status
          }

          return { ...event, status: newStatus }
        }
        return event
      }),
    )

    const event = events.find((e) => e.id === eventId)
    if (event) {
      toast({
        title: action === "complete" ? "Task Completed!" : action === "start" ? "Task Started" : "Task Skipped",
        description:
          action === "complete"
            ? `Great job! You earned ${event.points || 0} points.`
            : action === "start"
              ? `Started: ${event.title}`
              : `Skipped: ${event.title}`,
      })
    }
  }

  const days = getDaysInMonth(currentDate)
  const todayEvents = getEventsForDate(new Date())
  const upcomingEvents = events
    .filter((event) => event.startTime > new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5)

  const getDayStats = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    const completed = dayEvents.filter((e) => e.status === "completed").length
    const total = dayEvents.length
    const missed = dayEvents.filter((e) => e.status === "missed").length

    return { completed, total, missed, progress: total > 0 ? (completed / total) * 100 : 0 }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-background border-l shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Events</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileSidebar(false)}>
                  ×
                </Button>
              </div>
            </div>
            {/* Mobile sidebar content would go here */}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-xl md:text-2xl font-bold">Calendar</h1>
              <Badge variant="outline" className="text-xs">
                {filterPod !== "all" ? "Pod View" : "All Events"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateEvent}>
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Add Event</span>
              </Button>
            </div>
          </div>

          {/* Calendar Navigation */}
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

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={filterPod} onValueChange={setFilterPod}>
                <SelectTrigger className="w-24 md:w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pods</SelectItem>
                  <SelectItem value="dsa-masters">DSA Masters</SelectItem>
                  <SelectItem value="neet-biology">NEET Biology</SelectItem>
                  <SelectItem value="design-thinking">Design Hub</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-20 md:w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Grid */}
          <div className="flex-1 p-2 md:p-4 overflow-auto">
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 min-h-full">
              {/* Day headers */}
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={day}
                  className="p-1 md:p-2 text-center font-medium text-muted-foreground border-b text-xs md:text-sm"
                >
                  <span className="md:hidden">{day}</span>
                  <span className="hidden md:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-1 md:p-2 border border-muted min-h-[80px] md:min-h-[120px]" />
                }

                const dayEvents = getEventsForDate(day)
                const dayStats = getDayStats(day)
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-1 md:p-2 border border-muted cursor-pointer hover:bg-muted/50 transition-colors min-h-[80px] md:min-h-[120px] ${
                      isToday ? "bg-primary/10 border-primary" : ""
                    } ${isSelected ? "bg-muted" : ""}`}
                    onClick={() => {
                      setSelectedDate(day)
                      if (isMobile) {
                        setShowMobileSidebar(true)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs md:text-sm ${isToday ? "font-bold text-primary" : ""}`}>
                        {day.getDate()}
                      </span>
                      <div className="flex items-center gap-1">
                        {dayStats.total > 0 && (
                          <div className="flex items-center gap-0.5">
                            <div
                              className="w-2 h-2 rounded-full bg-green-500"
                              style={{
                                opacity: dayStats.progress / 100,
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {dayStats.completed}/{dayStats.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5 md:space-y-1">
                      {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => {
                        const eventType = eventTypes.find((t) => t.value === event.type)
                        const Icon = eventType?.icon || Clock

                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded text-white truncate ${event.color} border-l-2 ${getDifficultyColor(event.difficulty)} relative`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                              if (isMobile) {
                                setShowMobileSidebar(true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="w-2 h-2 flex-shrink-0" />
                              <span className="truncate flex-1">{event.title}</span>
                              <div className="absolute -top-0.5 -right-0.5">
                                {getStatusIcon(event.status || "pending")}
                              </div>
                            </div>
                            {event.points && (
                              <div className="text-xs opacity-75 flex items-center gap-1">
                                <Trophy className="w-2 h-2" />
                                {event.points}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {dayEvents.length > (isMobile ? 2 : 3) && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - (isMobile ? 2 : 3)} more
                        </div>
                      )}
                    </div>

                    {dayStats.total > 0 && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${dayStats.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-80 border-l bg-card flex-col">
          {/* Today's Events */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Schedule
            </h3>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event) => {
                  const eventType = eventTypes.find((t) => t.value === event.type)
                  const Icon = eventType?.icon || Clock

                  return (
                    <Card
                      key={event.id}
                      className={`cursor-pointer hover:bg-muted/50 border-l-4 ${getDifficultyColor(event.difficulty)}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              {getStatusIcon(event.status || "pending")}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </p>
                            {event.points && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Trophy className="w-3 h-3" />
                                {event.points} points
                              </div>
                            )}
                          </div>
                          {event.status === "pending" && (
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventAction(event.id, "start")
                                }}
                              >
                                Start
                              </Button>
                            </div>
                          )}
                          {event.status === "in-progress" && (
                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventAction(event.id, "complete")
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events today</p>
            )}
          </div>

          {/* Progress Overview */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Weekly Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Lessons Completed</span>
                <span className="font-medium">8/12</span>
              </div>
              <Progress value={67} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span>Quizzes Passed</span>
                <span className="font-medium">5/8</span>
              </div>
              <Progress value={63} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span>Quests Completed</span>
                <span className="font-medium">3/6</span>
              </div>
              <Progress value={50} className="h-2" />

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Current Streak</span>
                </div>
                <span className="font-bold text-orange-500">15 days</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          {selectedEvent && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Event Details</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {selectedEvent.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => handleEventAction(selectedEvent.id, "start")}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEventAction(selectedEvent.id, "skip")}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Skip Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {selectedEvent.status === "in-progress" && (
                      <>
                        <DropdownMenuItem onClick={() => handleEventAction(selectedEvent.id, "complete")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </DropdownMenuItem>
                    {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        View Resources
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${selectedEvent.color}`} />
                    <h4 className="font-medium">{selectedEvent.title}</h4>
                    {getStatusIcon(selectedEvent.status || "pending")}
                  </div>
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(selectedEvent.startTime)} at {formatTime(selectedEvent.startTime)} -{" "}
                      {formatTime(selectedEvent.endTime)}
                    </span>
                  </div>

                  {selectedEvent.difficulty && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{selectedEvent.difficulty} Difficulty</span>
                    </div>
                  )}

                  {selectedEvent.points && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.points} Points</span>
                    </div>
                  )}

                  {selectedEvent.podName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.podName}</span>
                    </div>
                  )}

                  {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Resources ({selectedEvent.resources.length})</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {selectedEvent.resources.map((resource, index) => (
                          <div key={index} className="text-xs text-blue-600 hover:underline cursor-pointer">
                            {resource}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedEvent.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => handleEventAction(selectedEvent.id, "start")}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Task
                    </Button>
                  </div>
                )}

                {selectedEvent.status === "in-progress" && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleEventAction(selectedEvent.id, "complete")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
