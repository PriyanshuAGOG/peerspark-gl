"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Play,
  Target,
  Zap,
  Star,
  ChevronRight,
  CalendarDays,
  Timer,
  Brain,
  FileText,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AIAssistant } from "@/components/ai-assistant"

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

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)

  // Sample data
  const [myPods] = useState<Pod[]>([
    {
      id: "1",
      name: "Advanced Mathematics",
      members: 12,
      subject: "Mathematics",
      nextSession: "Today, 3:00 PM",
      progress: 75,
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "Physics Study Group",
      members: 8,
      subject: "Physics",
      nextSession: "Tomorrow, 10:00 AM",
      progress: 60,
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "Computer Science Hub",
      members: 15,
      subject: "Computer Science",
      nextSession: "Friday, 2:00 PM",
      progress: 85,
      color: "bg-purple-500",
    },
  ])

  const [todaySessions] = useState<StudySession[]>([
    {
      id: "1",
      title: "Calculus Review",
      duration: 90,
      completed: true,
      podName: "Advanced Mathematics",
      scheduledTime: "9:00 AM",
    },
    {
      id: "2",
      title: "Physics Lab Discussion",
      duration: 60,
      completed: false,
      podName: "Physics Study Group",
      scheduledTime: "3:00 PM",
    },
    {
      id: "3",
      title: "Algorithm Practice",
      duration: 120,
      completed: false,
      podName: "Computer Science Hub",
      scheduledTime: "7:00 PM",
    },
  ])

  const [activeChallenge] = useState<Challenge>({
    id: "1",
    title: "Weekly Math Challenge",
    description: "Solve 50 calculus problems",
    difficulty: "Medium",
    points: 250,
    timeLeft: "2 days",
    participants: 156,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleScheduleSession = () => {
    setShowScheduleModal(true)
    // Navigate to calendar with schedule mode
    setTimeout(() => {
      router.push("/app/calendar?mode=schedule")
      toast({
        title: "Schedule Session",
        description: "Opening calendar to schedule your study session",
      })
    }, 500)
  }

  const handleNewSession = () => {
    setShowNewSessionModal(true)
    // Create new session logic
    setTimeout(() => {
      toast({
        title: "New Session Created",
        description: "Your study session has been created successfully",
      })
      setShowNewSessionModal(false)
    }, 1000)
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

  const completedSessions = todaySessions.filter((s) => s.completed).length
  const totalStudyTime = todaySessions.reduce((acc, session) => acc + session.duration, 0)
  const weeklyProgress = 68 // Sample weekly progress

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Alex! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleScheduleSession} className="bg-primary hover:bg-primary/90">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={handleNewSession} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Sessions</p>
                <p className="text-2xl font-bold">
                  {completedSessions}/{todaySessions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold">
                  {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Pods</p>
                <p className="text-2xl font-bold">{myPods.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Progress</p>
                <p className="text-2xl font-bold">{weeklyProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Pods */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Pods
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/app/pods")}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {myPods.map((pod) => (
                <div
                  key={pod.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleJoinPod(pod.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${pod.color}`} />
                    <div>
                      <h4 className="font-medium">{pod.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pod.members} members • Next: {pod.nextSession}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={pod.progress} className="w-16 h-2" />
                      <span className="text-sm font-medium">{pod.progress}%</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {pod.subject}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      session.completed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.completed ? "bg-green-500" : "bg-orange-500"}`} />
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.podName} • {session.duration} min • {session.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.completed ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          Completed
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4" onClick={handleViewCalendar}>
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Active Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{activeChallenge.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{activeChallenge.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      activeChallenge.difficulty === "Easy"
                        ? "secondary"
                        : activeChallenge.difficulty === "Medium"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {activeChallenge.difficulty}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{activeChallenge.points} points</p>
                    <p className="text-xs text-muted-foreground">{activeChallenge.timeLeft} left</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {activeChallenge.participants} participants
                </div>
                <Button onClick={handleContinueChallenge} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Continue Challenge
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => router.push("/app/ai")}
              >
                <Brain className="w-4 h-4 mr-2" />
                Ask AI Assistant
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => router.push("/app/explore")}
              >
                <Users className="w-4 h-4 mr-2" />
                Explore Pods
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => router.push("/app/vault")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Resource Vault
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => router.push("/app/analytics")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">7</div>
                <p className="text-sm text-muted-foreground">Days in a row</p>
                <div className="flex justify-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-primary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Keep it up! You're on fire 🔥</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}
