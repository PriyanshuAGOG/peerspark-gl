"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Users, Trophy, TrendingUp, Plus, Play, Target, Zap, Star, ChevronRight, CalendarDays, Timer, Brain, FileText, BarChart3, Flame, Bell, Settings, MessageSquare, Video, BookOpen } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { podsService, Pod } from "@/lib/services/pods"
import { calendarService, CalendarEvent } from "@/lib/services/calendar"
import { questsService, Quest, QuestProgress } from "@/lib/services/quests"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface StudySession {
  id: string
  title: string
  duration: number
  completed: boolean
  podName: string
  scheduledTime: string
}

interface Pod {
  id: string
  name: string
  members: number
  subject: string
  nextSession: string
  progress: number
  color: string
}

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  timeLeft: string
  participants: number
}

const STUDY_DATA = [
  { name: "Mon", hours: 4, sessions: 2, focus: 85 },
  { name: "Tue", hours: 6, sessions: 3, focus: 92 },
  { name: "Wed", hours: 3, sessions: 1, focus: 78 },
  { name: "Thu", hours: 5, sessions: 2, focus: 88 },
  { name: "Fri", hours: 7, sessions: 4, focus: 95 },
  { name: "Sat", hours: 8, sessions: 3, focus: 90 },
  { name: "Sun", hours: 5, sessions: 2, focus: 87 },
]

const SUBJECT_DATA = [
  { name: "DSA", hours: 15, percentage: 35, color: "#3B82F6" },
  { name: "Biology", hours: 12, percentage: 28, color: "#10B981" },
  { name: "Design", hours: 8, percentage: 19, color: "#8B5CF6" },
  { name: "Physics", hours: 5, percentage: 12, color: "#F59E0B" },
  { name: "Others", hours: 3, percentage: 6, color: "#6B7280" },
]

const PERFORMANCE_METRICS = [
  {
    title: "Study Streak",
    value: "15 days",
    change: "+3 from last week",
    trend: "up",
    icon: Flame,
    color: "text-accent",
  },
  {
    title: "Total Study Hours",
    value: "42.5h",
    change: "+8.5h from last week",
    trend: "up",
    icon: Clock,
    color: "text-blue-500",
  },
  {
    title: "Sessions Completed",
    value: "18",
    change: "+5 from last week",
    trend: "up",
    icon: Target,
    color: "text-green-500",
  },
  {
    title: "Average Focus Score",
    value: "88%",
    change: "+5% from last week",
    trend: "up",
    icon: Brain,
    color: "text-purple-500",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  const [myPods, setMyPods] = useState<Pod[]>([])
  const [isLoadingPods, setIsLoadingPods] = useState(true)
  const [todaySessions, setTodaySessions] = useState<CalendarEvent[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [activeChallenge, setActiveChallenge] = useState<Quest | null>(null)
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    const fetchData = async () => {
        if (user) {
            setIsLoadingPods(true)
            setIsLoadingSessions(true)
            setIsLoadingChallenge(true)

            // Fetch Pods
            const pods = await podsService.getUserPods(user.$id)
            setMyPods(pods)
            setIsLoadingPods(false)

            // Fetch Today's Sessions
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)
            const todayEnd = new Date()
            todayEnd.setHours(23, 59, 59, 999)
            const events = await calendarService.getUserEvents(user.$id, todayStart.toISOString(), todayEnd.toISOString())
            setTodaySessions(events)
            setIsLoadingSessions(false)

            // Fetch Active Challenge
            const progress = await questsService.getAllQuestProgressForUser(user.$id)
            const inProgressQuest = progress.find(p => p.status === 'in-progress')
            if (inProgressQuest) {
                const questDetails = await questsService.getQuest(inProgressQuest.questId)
                setActiveChallenge(questDetails)
            }
            setIsLoadingChallenge(false)
        }
    }

    fetchData()
    return () => clearInterval(timer)
  }, [user])

  const handleScheduleSession = () => {
    router.push("/app/calendar?mode=schedule")
    toast({
      title: "Schedule Session",
      description: "Opening calendar to schedule your study session",
    })
  }

  const handleNewSession = () => {
    router.push("/app/pods")
    toast({
      title: "New Session",
      description: "Opening pods to start a new session",
    })
  }

  const handleContinueChallenge = () => {
    router.push(`/app/challenges/${activeChallenge.id}`)
    toast({
      title: "Challenge Opened",
      description: `Continuing ${activeChallenge.title}`,
    })
  }

  const handleViewCalendar = () => {
    router.push("/app/calendar")
  }

  const handleJoinPod = (podId: string) => {
    router.push(`/app/pods/${podId}`)
  }

  const handleJoinSession = (sessionId: string) => {
    // This logic might need adjustment depending on how sessions are joined.
    // For now, we assume joining a session takes you to the pod page.
    const session = todaySessions.find(s => s.$id === sessionId)
    if (session?.podId) {
      router.push(`/app/pods/${session.podId}`)
    } else {
        toast({ title: "No linked pod for this session."})
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "ai":
        router.push("/app/ai")
        break
      case "explore":
        router.push("/app/explore")
        break
      case "vault":
        router.push("/app/vault")
        break
      case "analytics":
        router.push("/app/analytics")
        break
      default:
        toast({
          title: "Feature",
          description: `Opening ${action}...`,
        })
    }
  }

  // Calculated Stats
  const completedSessionsToday = todaySessions.filter((s) => s.isCompleted).length
  const totalStudyTimeToday = todaySessions.reduce((acc, session) => {
    const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    return acc + (duration > 0 ? duration : 0)
  }, 0)
  const totalStudyMinutesToday = Math.floor(totalStudyTimeToday / (1000 * 60))

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/app/notifications")}>
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/app/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your learning overview</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20 md:pb-8">
        <div className="space-y-4">
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Welcome back, Alex! 👋</h2>
                  <p className="text-sm text-muted-foreground">Ready to continue your learning journey?</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleScheduleSession} size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Schedule</span>
                  </Button>
                  <Button onClick={handleNewSession} variant="outline" size="sm" className="bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Sessions Today</p>
                    <p className="text-lg md:text-xl font-bold">
                      {completedSessionsToday}/{todaySessions.length}
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Study Time Today</p>
                    <p className="text-lg md:text-xl font-bold">
                      {Math.floor(totalStudyMinutesToday / 60)}h {totalStudyMinutesToday % 60}m
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Timer className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Active Pods</p>
                    <p className="text-lg md:text-xl font-bold">{myPods.length}</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Quests Active</p>
                    <p className="text-lg md:text-xl font-bold">{activeChallenge ? '1' : '0'}</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex space-x-1 bg-secondary/50 rounded-lg p-1 max-w-fit">
              {[
                { value: "overview", label: "Overview" },
                { value: "analytics", label: "Analytics" },
                { value: "schedule", label: "Schedule" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* My Pods */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      My Pods
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/app/pods")}>
                      <span className="text-xs">View All</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoadingPods ? (
                        <p className="text-sm text-muted-foreground">Loading your pods...</p>
                    ) : myPods.length === 0 ? (
                        <p className="text-sm text-muted-foreground">You haven't joined any pods yet.</p>
                    ) : (
                        myPods.map((pod, index) => {
                            const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
                            const podColor = colors[index % colors.length];
                            return (
                                <div
                                    key={pod.$id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => handleJoinPod(pod.$id)}
                                >
                                    <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${podColor}`} />
                                    <div>
                                        <h4 className="font-medium text-sm">{pod.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                        {pod.memberCount} members
                                        </p>
                                    </div>
                                    </div>
                                    <div className="text-right">
                                    <Badge variant="secondary" className="text-xs">
                                        {pod.subject}
                                    </Badge>
                                    </div>
                                </div>
                            )
                        })
                    )}
                  </CardContent>
                </Card>

                {/* Active Challenge */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Active Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingChallenge ? (
                        <p className="text-sm text-muted-foreground">Looking for active challenges...</p>
                    ) : activeChallenge ? (
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-sm">{activeChallenge.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{activeChallenge.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <Badge
                                variant={
                                    activeChallenge.difficulty === "easy"
                                    ? "secondary"
                                    : activeChallenge.difficulty === "medium"
                                        ? "default"
                                        : "destructive"
                                }
                                className="text-xs capitalize"
                                >
                                {activeChallenge.difficulty}
                                </Badge>
                                <div className="text-right">
                                <p className="text-xs font-medium">{activeChallenge.points} points</p>
                                </div>
                            </div>
                            <Button onClick={handleContinueChallenge} className="w-full">
                                <Target className="w-4 h-4 mr-2" />
                                Continue Challenge
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No active challenges right now. Good job!</p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent h-auto p-3"
                      onClick={() => handleQuickAction("ai")}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs">AI Assistant</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent h-auto p-3"
                      onClick={() => handleQuickAction("explore")}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">Explore</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent h-auto p-3"
                      onClick={() => handleQuickAction("vault")}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">Resources</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent h-auto p-3"
                      onClick={() => handleQuickAction("analytics")}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs">Analytics</span>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Study Streak */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Study Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-primary">15</div>
                      <p className="text-xs text-muted-foreground">Days in a row</p>
                      <div className="flex justify-center gap-1">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-primary" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Keep it up! You're on fire 🔥</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {PERFORMANCE_METRICS.map((metric) => (
                    <Card key={metric.title}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
                            <p className="text-sm font-bold">{metric.value}</p>
                            <p className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                              {metric.change}
                            </p>
                          </div>
                          <div className={`p-2 rounded-full bg-secondary ${metric.color}`}>
                            <metric.icon className="w-3 h-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Study Hours Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Weekly Study Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={STUDY_DATA}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="hours" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Subject Distribution */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subject Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={SUBJECT_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="hours"
                        >
                          {SUBJECT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-4">
                {/* Today's Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSessions ? (
                        <p className="text-sm text-muted-foreground">Loading today's schedule...</p>
                    ) : todaySessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">You have no sessions scheduled for today.</p>
                    ) : (
                        <div className="space-y-3">
                        {todaySessions.map((session) => (
                            <div
                            key={session.$id}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                                session.isCompleted
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "hover:bg-accent/50 cursor-pointer"
                            }`}
                            onClick={() => !session.isCompleted && handleJoinSession(session.$id)}
                            >
                            <div className="flex items-start space-x-4">
                                <div
                                className={`w-2 h-2 rounded-full mt-2 ${session.isCompleted ? "bg-green-500" : "bg-orange-500"}`}
                                />
                                <div className="flex-1">
                                <h4 className="font-medium text-sm">{session.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {session.isCompleted ? (
                                <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
                                >
                                    ✓ Completed
                                </Badge>
                                ) : (
                                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                    <Play className="w-3 h-3 mr-1" />
                                    Join
                                </Button>
                                )}
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    <Button variant="ghost" className="w-full mt-3" onClick={handleViewCalendar}>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Full Calendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
