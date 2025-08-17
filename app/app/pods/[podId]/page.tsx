"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Users,
  Settings,
  Crown,
  Video,
  MessageSquare,
  FolderOpen,
  Share2,
  Star,
  Target,
  Download,
  Clock,
  Play,
  Upload,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  Hand,
  BookOpen,
  Calendar,
  Home,
  ArrowLeft,
  Send,
  VideoOff,
  FileText,
  Activity,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  Bookmark,
  ExternalLink,
  UserCheck,
  Presentation,
  BarChart3,
  Trophy,
  Flame,
  Award,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import InteractiveWhiteboard from "@/components/interactive-whiteboard"
import { questsService, Quest } from "@/lib/services/quests"
import { podsService, Pod } from "@/lib/services/pods"
import { useAuth } from "@/contexts/auth-context"

// TODO: Replace with real data
const POD_MEMBERS: any[] = []
const POD_RESOURCES: any[] = []

// Custom Pod Navigation Component - Only show on mobile
function PodNavigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "daily-tasks", label: "Tasks", icon: Target },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "classroom", label: "Live", icon: Video },
    { id: "resources", label: "Vault", icon: FolderOpen },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center h-16 text-xs transition-colors ${
              activeTab === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <item.icon className={`h-4 w-4 ${activeTab === item.id && "text-primary"}`} />
            <span className={`font-medium mt-1 ${activeTab === item.id && "text-primary"}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DailyTasksComponent({ podId }: { podId: string }) {
  const [activeTaskTab, setActiveTaskTab] = useState("learn")
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [questCode, setQuestCode] = useState("")
  const [questSubmitted, setQuestSubmitted] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const { toast } = useToast()
  const [dailyLesson, setDailyLesson] = useState<Quest | null>(null)
  const [dailyQuiz, setDailyQuiz] = useState<Quest | null>(null)
  const [dailyQuest, setDailyQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuests = async () => {
      setIsLoading(true)
      const quests = await questsService.getQuestsForPod(podId)
      // This is a simplified logic. A real app would have a way to determine today's tasks.
      setDailyLesson(quests.find(q => q.type === 'lesson') || null)
      setDailyQuiz(quests.find(q => q.type === 'quiz') || null)
      setDailyQuest(quests.find(q => q.type === 'quest') || null)
      setIsLoading(false)
    }
    fetchQuests()
  }, [podId])


  if (isLoading) return <div>Loading tasks...</div>
  if (!dailyLesson || !dailyQuiz || !dailyQuest) return <div>Today's tasks not available yet.</div>

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      if (activeTaskTab === "quiz" && !quizSubmitted) {
        handleQuizSubmit()
      }
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds, activeTaskTab, quizSubmitted, handleQuizSubmit])

  const startQuiz = () => {
    if (!dailyQuiz || !dailyQuiz.timeLimit) return;
    setTimerSeconds(dailyQuiz.timeLimit * 60)
    setIsTimerRunning(true)
    setCurrentQuizQuestion(0)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const handleQuizAnswer = (questionId: number, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  function handleQuizSubmit() {
    if (!dailyQuiz) return;
    setIsTimerRunning(false)
    setQuizSubmitted(true)

    const questions = JSON.parse(dailyQuiz.questions || '[]')
    const correctAnswers = questions.filter((q: any) => quizAnswers[q.id] === q.correct).length

    const score = Math.round((correctAnswers / questions.length) * 100)
    const points = Math.round((score / 100) * dailyQuiz.points)

    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}% and earned ${points} points!`,
    })
  }

  const handleQuestSubmit = () => {
    if (!questCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please write your solution before submitting.",
        variant: "destructive",
      })
      return
    }

    setQuestSubmitted(true)
    toast({
      title: "Quest Submitted!",
      description: "Your solution has been submitted for review. You'll receive feedback soon!",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
        {/* ... JSX for DailyTasksComponent ... */}
    </div>
  )
}

function PodPageComponent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [pod, setPod] = useState<Pod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { podId } = useParams()

  useEffect(() => {
      const fetchPod = async () => {
          if (typeof podId !== 'string') return;
          setIsLoading(true);
          const podDetails = await podsService.getPod(podId);
          setPod(podDetails);
          setIsLoading(false);
      }
      fetchPod();
  }, [podId])

  if (isLoading) return <div>Loading Pod...</div>
  if (!pod) return <div>Pod not found.</div>

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
        <PodNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* ... rest of the PodPage JSX using `pod` state ... */}
    </div>
  )
}

export default function PodPage() {
  return <PodPageComponent />
}
