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

  // Mock data for daily tasks
  const dailyLesson = {
    id: "lesson-1",
    title: "Binary Search Trees - Advanced Operations",
    description: "Learn about complex BST operations including balancing, rotation, and optimization techniques",
    content: `
# Binary Search Trees - Advanced Operations

## Introduction
Binary Search Trees (BSTs) are fundamental data structures that maintain sorted data and allow for efficient searching, insertion, and deletion operations.

## Key Concepts

### 1. Tree Balancing
- **AVL Trees**: Self-balancing BSTs with height difference ≤ 1
- **Red-Black Trees**: Balanced BSTs with color properties
- **Splay Trees**: Self-adjusting BSTs that move frequently accessed nodes to root

### 2. Rotation Operations
- **Left Rotation**: Used when right subtree is heavier
- **Right Rotation**: Used when left subtree is heavier
- **Double Rotations**: Combination of left and right rotations

### 3. Performance Analysis
- **Best Case**: O(log n) for all operations
- **Worst Case**: O(n) for unbalanced trees
- **Average Case**: O(log n) with proper balancing

## Implementation Example

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
        self.height = 1

def get_height(node):
    if not node:
        return 0
    return node.height

def get_balance(node):
    if not node:
        return 0
    return get_height(node.left) - get_height(node.right)

def rotate_right(y):
    x = y.left
    T2 = x.right
    
    # Perform rotation
    x.right = y
    y.left = T2
    
    # Update heights
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    
    return x
\`\`\`

## Practice Problems
1. Implement AVL tree insertion with automatic balancing
2. Find the lowest common ancestor in a BST
3. Convert a sorted array to a balanced BST
4. Validate if a binary tree is a valid BST
    `,
    duration: "45 minutes",
    difficulty: "Advanced",
    points: 75,
    resources: [
      { name: "BST Visualization Tool", url: "#", type: "interactive" },
      { name: "Advanced BST Problems", url: "#", type: "pdf" },
      { name: "Video: Tree Rotations", url: "#", type: "video" },
    ],
  }

  const dailyQuiz = {
    id: "quiz-1",
    title: "BST Operations Quiz",
    description: "Test your understanding of binary search tree operations and balancing",
    timeLimit: 15, // minutes
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: "What is the time complexity of searching in a balanced BST?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(log n)",
        explanation: "In a balanced BST, the height is O(log n), so search operations take O(log n) time.",
      },
      {
        id: 2,
        question: "Which rotation is needed when a node's left child has a right-heavy subtree?",
        options: ["Left rotation", "Right rotation", "Left-Right rotation", "Right-Left rotation"],
        correct: "Left-Right rotation",
        explanation:
          "This is a Left-Right case requiring a double rotation: first left on the child, then right on the parent.",
      },
      {
        id: 3,
        question: "In an AVL tree, what is the maximum allowed height difference between subtrees?",
        options: ["0", "1", "2", "3"],
        correct: "1",
        explanation: "AVL trees maintain the balance factor (height difference) of at most 1 for all nodes.",
      },
      {
        id: 4,
        question: "What happens during an in-order traversal of a BST?",
        options: [
          "Nodes are visited in random order",
          "Nodes are visited in ascending order",
          "Nodes are visited in descending order",
          "Only leaf nodes are visited",
        ],
        correct: "Nodes are visited in ascending order",
        explanation: "In-order traversal of a BST visits nodes in sorted (ascending) order.",
      },
      {
        id: 5,
        question: "Which of the following is NOT a self-balancing BST?",
        options: ["AVL Tree", "Red-Black Tree", "Splay Tree", "Binary Heap"],
        correct: "Binary Heap",
        explanation: "Binary Heap is a complete binary tree that satisfies heap property, not a BST.",
      },
    ],
  }

  const dailyQuest = {
    id: "quest-1",
    title: "Implement AVL Tree Insert",
    description: "Build a complete AVL tree insertion function with automatic balancing",
    difficulty: "Hard",
    points: 150,
    timeEstimate: "2-3 hours",
    requirements: [
      "Implement TreeNode class with height tracking",
      "Create helper functions for height and balance calculation",
      "Implement left and right rotation functions",
      "Build the main insert function with balancing logic",
      "Handle all four rotation cases (LL, RR, LR, RL)",
    ],
    testCases: [
      {
        input: "Insert [10, 20, 30, 40, 50, 25]",
        expected: "Balanced AVL tree with proper rotations",
      },
      {
        input: "Insert [1, 2, 3, 4, 5, 6, 7]",
        expected: "Height-balanced tree with height ≤ 3",
      },
    ],
    starterCode: `class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

def get_height(node):
    # TODO: Implement height calculation
    pass

def get_balance(node):
    # TODO: Implement balance factor calculation
    pass

def rotate_left(x):
    # TODO: Implement left rotation
    pass

def rotate_right(y):
    # TODO: Implement right rotation
    pass

def insert_avl(root, val):
    # TODO: Implement AVL insertion with balancing
    pass

# Test your implementation
root = None
values = [10, 20, 30, 40, 50, 25]
for val in values:
    root = insert_avl(root, val)
    print(f"Inserted {val}, tree height: {get_height(root)}")`,
    hints: [
      "Start by implementing basic BST insertion",
      "Calculate balance factor after each insertion",
      "Identify which rotation case applies",
      "Update heights after rotations",
      "Test with edge cases like duplicate values",
    ],
  }

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
  }, [isTimerRunning, timerSeconds, activeTaskTab, quizSubmitted])

  const startQuiz = () => {
    setTimerSeconds(dailyQuiz.timeLimit * 60)
    setIsTimerRunning(true)
    setCurrentQuizQuestion(0)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const handleQuizAnswer = (questionId: number, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleQuizSubmit = () => {
    setIsTimerRunning(false)
    setQuizSubmitted(true)

    const correctAnswers = dailyQuiz.questions.filter((q) => quizAnswers[q.id] === q.correct).length

    const score = Math.round((correctAnswers / dailyQuiz.questions.length) * 100)
    const points = Math.round((score / 100) * 100) // Max 100 points for quiz

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

  const [activeTab, setActiveTab] = useState("overview")
  const [isInSession, setIsInSession] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const router = useRouter()
  const { podId: routePodId } = useParams()

  const handleBackToPods = () => {
    router.push("/app/pods")
  }

  const handleJoinSession = () => {
    setIsInSession(true)
  }

  const handleLeaveSession = () => {
    setIsInSession(false)
  }

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn)
  }

  const handleAudioToggle = () => {
    setIsAudioOn(!isAudioOn)
  }

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  const handleShowWhiteboard = () => {
    setShowWhiteboard(true)
  }

  const handlePlayVideo = (videoId: string) => {
    // Placeholder for video playing logic
    toast({
      title: "Video Playing",
      description: `Playing video with ID: ${videoId}`,
    })
  }

  const handleOpenChat = () => {
    // Placeholder for opening full chat
    toast({
      title: "Opening Chat",
      description: "Opening the full chat interface",
    })
  }

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        author: "You", // Replace with actual user name
        content: chatInput,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, newMessage])
      setChatInput("")
    }
  }

  const handleOpenVault = () => {
    // Placeholder for opening the vault
    toast({
      title: "Opening Vault",
      description: "Opening the pod resources vault",
    })
  }

  const handleOpenCalendar = () => {
    // Placeholder for opening the calendar
    toast({
      title: "Opening Calendar",
      description: "Opening the pod calendar",
    })
  }

  // Mock data for pod details
  const pod = {
    id: routePodId,
    name: "Advanced Algorithms Study Group",
    description:
      "A focused study group for mastering advanced algorithms and data structures. Perfect for competitive programming enthusiasts.",
    members: 125,
    rating: 4.7,
    difficulty: "Advanced",
    role: "Leader",
    progress: 75,
    streak: 22,
    stats: {
      studyHours: 68,
      totalSessions: 42,
      completionRate: 88,
      averageRating: 4.8,
    },
    weeklyHours: "8-10 hours",
    nextSession: "Tomorrow, 8:00 PM",
    tags: ["Algorithms", "Data Structures", "Competitive Programming", "LeetCode"],
    mentor: {
      name: "Dr. Emily Carter",
      title: "Professor of Computer Science",
      avatar: "/avatars/avatar-3.png",
      bio: "Dr. Carter is a renowned expert in algorithms and data structures with over 15 years of experience in teaching and research.",
    },
  }

  const POD_MEMBERS = [
    {
      id: "member-1",
      name: "Alice Johnson",
      avatar: "/avatars/avatar-1.png",
      role: "Moderator",
      isOnline: true,
      streak: 30,
      contributions: 52,
      joinedDate: "2023-08-15",
    },
    {
      id: "member-2",
      name: "Bob Williams",
      avatar: "/avatars/avatar-2.png",
      role: "Member",
      isOnline: false,
      streak: 15,
      contributions: 28,
      joinedDate: "2023-09-01",
    },
    {
      id: "member-3",
      name: "Charlie Brown",
      avatar: "/avatars/avatar-4.png",
      role: "Member",
      isOnline: true,
      streak: 7,
      contributions: 12,
      joinedDate: "2023-09-15",
    },
    {
      id: "member-4",
      name: "Diana Miller",
      avatar: "/avatars/avatar-5.png",
      role: "Member",
      isOnline: false,
      streak: 2,
      contributions: 5,
      joinedDate: "2023-10-01",
    },
  ]

  const POD_RESOURCES = [
    {
      id: "resource-1",
      title: "Advanced DP Patterns",
      description: "A comprehensive guide to advanced dynamic programming techniques and patterns.",
      author: "Alice Johnson",
      type: "pdf",
      size: "2.5 MB",
      downloads: 125,
    },
    {
      id: "resource-2",
      title: "Graph Algorithms Explained",
      description: "A detailed video tutorial explaining various graph algorithms with real-world examples.",
      author: "Bob Williams",
      type: "videos",
      size: "150 MB",
      downloads: 88,
    },
    {
      id: "resource-3",
      title: "Segment Tree Implementation",
      description: "A step-by-step guide to implementing segment trees for efficient range queries.",
      author: "Charlie Brown",
      type: "pdf",
      size: "1.8 MB",
      downloads: 62,
    },
  ]

  function VideoCallInterface({
    isActive,
    participants,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onLeave,
    isVideoOn,
    isAudioOn,
    isScreenSharing,
  }: {
    isActive: boolean
    participants: any[]
    onToggleVideo: () => void
    onToggleAudio: () => void
    onToggleScreenShare: () => void
    onLeave: () => void
    isVideoOn: boolean
    isAudioOn: boolean
    isScreenSharing: boolean
  }) {
    return (
      <div className="relative">
        {isActive ? (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive">Live</Badge>
          </div>
        ) : null}
        <div className="flex justify-center items-center h-full">
          {isActive ? (
            <div className="flex flex-col items-center">
              <div className="flex space-x-4">
                <button onClick={onToggleVideo}>{isVideoOn ? <Camera /> : <CameraOff />}</button>
                <button onClick={onToggleAudio}>{isAudioOn ? <Mic /> : <MicOff />}</button>
                <button onClick={onToggleScreenShare}>{isScreenSharing ? <ScreenShare /> : <ScreenShare />}</button>
                <button onClick={onLeave}>
                  <VideoOff />
                </button>
              </div>
              <div className="mt-4">Participants: {participants.length}</div>
            </div>
          ) : (
            <div>Session is not active</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Mobile Header with Back Button */}
      <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-4 safe-area-top">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={handleBackToPods} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={pod.mentor.avatar || "/placeholder.svg"} />
            <AvatarFallback>{pod.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{pod.name}</h1>
            <p className="text-sm text-muted-foreground">{pod.members.toLocaleString()} members</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block relative mb-6 lg:mb-8">
        <div className="relative h-40 lg:h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 text-white">
            <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
              <Avatar className="h-12 w-12 lg:h-16 lg:w-16 border-4 border-white/20">
                <AvatarImage src={pod.mentor.avatar || "/placeholder.svg"} />
                <AvatarFallback>{pod.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold">{pod.name}</h1>
                <p className="text-sm lg:text-lg opacity-90">{pod.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Badge className="bg-white/20 text-white border-white/30 text-xs lg:text-sm">
                <Users className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                {pod.members.toLocaleString()} members
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-xs lg:text-sm">
                <Star className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                {pod.rating} rating
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-xs lg:text-sm">{pod.difficulty}</Badge>
              {pod.role === "Leader" && (
                <Badge className="bg-yellow-500/80 text-white text-xs lg:text-sm">
                  <Crown className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                  Leader
                </Badge>
              )}
            </div>
          </div>
          <div className="absolute top-4 lg:top-6 right-4 lg:right-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs lg:text-sm"
              >
                <Share2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-8 w-8 lg:h-auto lg:w-auto p-1 lg:p-2"
              >
                <Settings className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-4 xl:px-8">
        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block mb-4 lg:mb-6">
          <div className="flex space-x-1 bg-secondary/50 rounded-lg p-1 max-w-fit overflow-x-auto">
            {[
              { value: "overview", label: "Overview", icon: Home },
              { value: "daily-tasks", label: "Daily Tasks", icon: Target },
              { value: "classroom", label: "Live Session", icon: Video },
              { value: "chat", label: "Chat", icon: MessageSquare },
              { value: "resources", label: "Resources", icon: FolderOpen },
              { value: "progress", label: "Progress", icon: BarChart3 },
              { value: "members", label: "Members", icon: Users },
              { value: "calendar", label: "Schedule", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-4">
          {activeTab === "daily-tasks" && <DailyTasksComponent podId={routePodId} />}

          {activeTab === "overview" && (
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Your Progress */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center text-lg lg:text-xl">
                      <Target className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Progress</span>
                          <span className="text-sm text-muted-foreground">{pod.progress}%</span>
                        </div>
                        <Progress value={pod.progress} className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Study Streak</span>
                          <span className="text-sm text-muted-foreground">{pod.streak} days</span>
                        </div>
                        <Progress value={(pod.streak / 30) * 100} className="w-full" />
                      </div>
                    </div>
                    <div className="grid gap-3 lg:gap-4 grid-cols-3">
                      <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                        <div className="text-xl lg:text-2xl font-bold text-blue-600">{pod.stats.studyHours}</div>
                        <div className="text-xs lg:text-sm text-muted-foreground">Study Hours</div>
                      </div>
                      <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                        <div className="text-xl lg:text-2xl font-bold text-green-600">{pod.stats.totalSessions}</div>
                        <div className="text-xs lg:text-sm text-muted-foreground">Sessions Attended</div>
                      </div>
                      <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                        <div className="text-xl lg:text-2xl font-bold text-purple-600">{pod.stats.completionRate}%</div>
                        <div className="text-xs lg:text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    <Button
                      onClick={() => setActiveTab("daily-tasks")}
                      className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <Target className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-xs lg:text-sm">Daily Tasks</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("classroom")}
                      variant="outline"
                      className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30"
                    >
                      <Video className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                      <span className="text-xs lg:text-sm">Join Live</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("chat")}
                      variant="outline"
                      className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                    >
                      <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      <span className="text-xs lg:text-sm">Pod Chat</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("resources")}
                      variant="outline"
                      className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30"
                    >
                      <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                      <span className="text-xs lg:text-sm">Resources</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center text-lg lg:text-xl">
                      <Activity className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                    mr-2" /> Recent Activity CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New resource uploaded: "Advanced DP Patterns"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Live session scheduled for tomorrow 8 PM</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 new members joined the pod</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 lg:space-y-6">
                {/* Mentor Info */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="text-lg lg:text-xl">Pod Mentor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
                        <AvatarImage src={pod.mentor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{pod.mentor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-sm lg:text-base">{pod.mentor.name}</h4>
                        <p className="text-xs lg:text-sm text-muted-foreground">{pod.mentor.title}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-muted-foreground">4.9 rating</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs lg:text-sm text-muted-foreground">{pod.mentor.bio}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent text-xs lg:text-sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent text-xs lg:text-sm">
                        <Video className="w-3 h-3 mr-1" />
                        1:1 Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Session */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center text-lg lg:text-xl">
                      <Clock className="w-4 h-4 mr-2" />
                      Next Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg">
                      <div className="text-base lg:text-lg font-bold text-red-600">{pod.nextSession}</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">Graph Algorithms Deep Dive</div>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>

                {/* Pod Stats */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="text-lg lg:text-xl">Pod Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-semibold text-sm">{pod.stats.averageRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly Hours</span>
                      <span className="font-semibold text-sm">{pod.weeklyHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-semibold text-sm">{pod.stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Members</span>
                      <span className="font-semibold text-sm">89%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="text-lg lg:text-xl">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pod.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "classroom" && (
            <div className="space-y-4 lg:space-y-6">
              {/* Main Video/Content Area */}
              <div className="grid gap-4 lg:gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-4">
                  {/* Video Player / Screen Share Area */}
                  <Card className="bg-black text-white">
                    <CardContent className="p-0 relative aspect-video">
                      <VideoCallInterface
                        isActive={isInSession}
                        participants={POD_MEMBERS}
                        onToggleVideo={handleVideoToggle}
                        onToggleAudio={handleAudioToggle}
                        onToggleScreenShare={handleScreenShare}
                        onLeave={handleLeaveSession}
                        isVideoOn={isVideoOn}
                        isAudioOn={isAudioOn}
                        isScreenSharing={isScreenSharing}
                      />

                      {!isInSession && (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                          <div className="text-center">
                            <Video className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-white" />
                            <p className="text-base lg:text-lg">Virtual Classroom</p>
                            <p className="text-sm text-gray-400">Join the live session to participate</p>
                            <Button onClick={handleJoinSession} className="mt-4 bg-red-600 hover:bg-red-700">
                              Join Live Session
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Session Controls */}
                  {isInSession && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>Session Tools</span>
                          <Badge variant="default" className="bg-red-600">
                            LIVE
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                          <Button
                            onClick={handleShowWhiteboard}
                            variant="outline"
                            className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                          >
                            <Presentation className="w-5 h-5 lg:w-6 lg:h-6" />
                            <span className="text-xs lg:text-sm">Whiteboard</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                          >
                            <Hand className="w-5 h-5 lg:w-6 lg:h-6" />
                            <span className="text-xs lg:text-sm">Raise Hand</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                          >
                            <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
                            <span className="text-xs lg:text-sm">Share File</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                          >
                            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6" />
                            <span className="text-xs lg:text-sm">Notes</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Video Resources */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Session Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                          <div className="w-12 h-9 lg:w-16 lg:h-12 bg-red-600 rounded flex items-center justify-center">
                            <Play className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">Graph Algorithms Explained</h4>
                            <p className="text-xs text-muted-foreground">45:30 • 234K views</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePlayVideo("graph-algorithms")}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                          <div className="w-12 h-9 lg:w-16 lg:h-12 bg-red-600 rounded flex items-center justify-center">
                            <Play className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">Dynamic Programming Patterns</h4>
                            <p className="text-xs text-muted-foreground">1:02:15 • 156K views</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePlayVideo("dp-patterns")}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Session Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Session Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!isInSession ? (
                        <Button onClick={handleJoinSession} className="w-full bg-red-600 hover:bg-red-700">
                          <Video className="w-4 h-4 mr-2" />
                          Join Live Session
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-red-600">LIVE SESSION</span>
                            </div>
                            <p className="text-xs text-muted-foreground">45:30 elapsed</p>
                          </div>
                          <Button onClick={handleLeaveSession} variant="destructive" className="w-full">
                            <VideoOff className="w-4 h-4 mr-2" />
                            Leave Session
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Participants */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Participants ({POD_MEMBERS.length + 1})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {/* Current user */}
                          <div className="flex items-center space-x-3 p-2 bg-primary/10 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">You</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">You</p>
                              <p className="text-xs text-muted-foreground">Host</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {isVideoOn && <Camera className="w-3 h-3 text-green-500" />}
                              {isAudioOn && <Mic className="w-3 h-3 text-green-500" />}
                            </div>
                          </div>

                          {POD_MEMBERS.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50"
                            >
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{member.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                {member.role === "Moderator" && <Crown className="w-3 h-3 text-yellow-500" />}
                                {member.isOnline && (
                                  <>
                                    <Camera className="w-3 h-3 text-green-500" />
                                    <Mic className="w-3 h-3 text-green-500" />
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="fixed inset-0 z-40 bg-background md:relative md:inset-auto md:z-auto">
              <div className="flex flex-col h-screen md:h-96">
                {/* Mobile Chat Header */}
                <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 safe-area-top">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("overview")}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={pod.mentor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{pod.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm truncate">{pod.name} Chat</h2>
                        <p className="text-xs text-muted-foreground">{pod.members.toLocaleString()} members</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleOpenChat} className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Chat Header */}
                <div className="hidden md:block">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Pod Chat
                      </CardTitle>
                      <Button onClick={handleOpenChat} variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Full Chat
                      </Button>
                    </div>
                  </CardHeader>
                </div>

                {/* Chat Content */}
                <div className="flex-1 flex flex-col min-h-0 md:p-4">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3 p-4 md:p-0">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div key={message.id} className="flex items-start space-x-3">
                            <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                              <AvatarFallback className="text-xs">{message.author.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{message.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="border-t bg-card p-4 safe-area-bottom">
                    <div className="flex space-x-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendChatMessage} disabled={!chatInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pod Resources</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={handleOpenVault} variant="outline" className="bg-transparent">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    View All Resources
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {POD_RESOURCES.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 lg:p-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center">
                            {resource.type === "videos" ? (
                              <Play className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
                            ) : (
                              <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>By {resource.author}</span>
                              <span>{resource.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              {resource.downloads}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {resource.downloads * 3}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 bg-transparent">
                              <Download className="w-3 h-3 mr-1" />
                              Get
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pod Members ({pod.members.toLocaleString()})</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search members..." className="pl-10 w-48 lg:w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {POD_MEMBERS.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 lg:p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs lg:text-sm">{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            {member.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm lg:text-base truncate">{member.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                              {member.role === "Moderator" && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-secondary/50 rounded-lg">
                            <div className="text-sm font-semibold">{member.streak}</div>
                            <div className="text-xs text-muted-foreground">Day Streak</div>
                          </div>
                          <div className="p-2 bg-secondary/50 rounded-lg">
                            <div className="text-sm font-semibold">{member.contributions}</div>
                            <div className="text-xs text-muted-foreground">Contributions</div>
                          </div>
                          <div className="p-2 bg-secondary/50 rounded-lg">
                            <div className="text-sm font-semibold">4.8</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Joined {member.joinedDate}</span>
                          <span className={member.isOnline ? "text-green-600" : "text-gray-500"}>
                            {member.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent text-xs">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Follow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="fixed inset-0 z-40 bg-background md:relative md:inset-auto md:z-auto">
              <div className="flex flex-col h-screen md:h-96">
                {/* Mobile Calendar Header */}
                <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 safe-area-top">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("overview")}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Calendar className="h-5 w-5" />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm truncate">{pod.name} Calendar</h2>
                        <p className="text-xs text-muted-foreground">Upcoming sessions and events</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleOpenCalendar} className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Pod Calendar</h3>
                    <p className="text-muted-foreground mb-4 text-sm lg:text-base">View upcoming sessions and events</p>
                    <Button onClick={handleOpenCalendar} className="bg-primary hover:bg-primary/90">
                      Open Full Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              {/* Pod Overview Stats */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Trophy className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-muted-foreground">Pod Completion Rate</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">92</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                        <Flame className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">34</div>
                    <div className="text-sm text-muted-foreground">Average Streak</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Total Points Earned</div>
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboard and Weekly Progress */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Performers Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                      Top Performers This Week
                    </CardTitle>
                    <CardDescription>Members with highest quest completion rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          rank: 1,
                          name: "Alice Johnson",
                          avatar: "/avatars/avatar-1.png",
                          points: 450,
                          quests: 12,
                          streak: 30,
                          badge: "🥇",
                        },
                        {
                          rank: 2,
                          name: "Bob Williams",
                          avatar: "/avatars/avatar-2.png",
                          points: 420,
                          quests: 11,
                          streak: 25,
                          badge: "🥈",
                        },
                        {
                          rank: 3,
                          name: "Charlie Brown",
                          avatar: "/avatars/avatar-4.png",
                          points: 380,
                          quests: 10,
                          streak: 22,
                          badge: "🥉",
                        },
                        {
                          rank: 4,
                          name: "Diana Miller",
                          avatar: "/avatars/avatar-5.png",
                          points: 340,
                          quests: 9,
                          streak: 18,
                          badge: "",
                        },
                        {
                          rank: 5,
                          name: "Eve Davis",
                          avatar: "/avatars/avatar-3.png",
                          points: 320,
                          quests: 8,
                          streak: 15,
                          badge: "",
                        },
                      ].map((member) => (
                        <div
                          key={member.rank}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold">
                            {member.badge || member.rank}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.quests} quests • {member.streak} day streak
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">{member.points}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Progress Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                      Weekly Progress Overview
                    </CardTitle>
                    <CardDescription>Pod-wide completion rates by day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { day: "Monday", completed: 85, total: 100, percentage: 85 },
                        { day: "Tuesday", completed: 92, total: 100, percentage: 92 },
                        { day: "Wednesday", completed: 78, total: 100, percentage: 78 },
                        { day: "Thursday", completed: 95, total: 100, percentage: 95 },
                        { day: "Friday", completed: 88, total: 100, percentage: 88 },
                        { day: "Saturday", completed: 72, total: 100, percentage: 72 },
                        { day: "Sunday", completed: 65, total: 100, percentage: 65 },
                      ].map((day) => (
                        <div key={day.day} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{day.day}</span>
                            <span className="text-sm text-muted-foreground">
                              {day.completed}/{day.total} ({day.percentage}%)
                            </span>
                          </div>
                          <Progress value={day.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Progress Tracking */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Your Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                      Your Progress
                    </CardTitle>
                    <CardDescription>Your performance in this pod</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">Rank #7</div>
                      <div className="text-sm text-muted-foreground">out of {pod.members} members</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Tasks</span>
                        <span className="text-sm font-medium">18/21 (86%)</span>
                      </div>
                      <Progress value={86} />

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quizzes</span>
                        <span className="text-sm font-medium">12/14 (86%)</span>
                      </div>
                      <Progress value={86} />

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Coding Quests</span>
                        <span className="text-sm font-medium">5/7 (71%)</span>
                      </div>
                      <Progress value={71} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <div className="text-lg font-bold">285</div>
                        <div className="text-xs text-muted-foreground">Points Earned</div>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <div className="text-lg font-bold">15</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pod Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-500" />
                      Pod Achievements
                    </CardTitle>
                    <CardDescription>Collective milestones reached</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Study Warriors",
                          description: "1000+ total study hours",
                          icon: "⚔️",
                          earned: true,
                          progress: 100,
                        },
                        {
                          title: "Knowledge Seekers",
                          description: "500+ quests completed",
                          icon: "🔍",
                          earned: true,
                          progress: 100,
                        },
                        {
                          title: "Consistency Champions",
                          description: "30-day pod streak",
                          icon: "🏆",
                          earned: false,
                          progress: 75,
                        },
                        {
                          title: "Collaboration Masters",
                          description: "100+ peer reviews",
                          icon: "🤝",
                          earned: false,
                          progress: 60,
                        },
                      ].map((achievement) => (
                        <div
                          key={achievement.title}
                          className={`p-3 rounded-lg border ${achievement.earned ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200" : "bg-secondary/30"}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{achievement.title}</div>
                              <div className="text-xs text-muted-foreground">{achievement.description}</div>
                              <div className="mt-2">
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress value={achievement.progress} className="h-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest pod achievements and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          type: "achievement",
                          user: "Alice Johnson",
                          action: "earned 'Quiz Master' badge",
                          time: "2 hours ago",
                          icon: "🏆",
                        },
                        {
                          type: "milestone",
                          user: "Pod",
                          action: "reached 1000 total study hours",
                          time: "5 hours ago",
                          icon: "⚔️",
                        },
                        {
                          type: "quest",
                          user: "Bob Williams",
                          action: "completed Advanced BST Quest",
                          time: "1 day ago",
                          icon: "✅",
                        },
                        {
                          type: "streak",
                          user: "Charlie Brown",
                          action: "achieved 20-day streak",
                          time: "1 day ago",
                          icon: "🔥",
                        },
                        {
                          type: "collaboration",
                          user: "Diana Miller",
                          action: "helped 5 members with code review",
                          time: "2 days ago",
                          icon: "🤝",
                        },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-secondary/50">
                          <div className="text-lg">{activity.icon}</div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{activity.user}</span> {activity.action}
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Member Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-500" />
                    Member Progress Details
                  </CardTitle>
                  <CardDescription>Detailed breakdown of all member progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {POD_MEMBERS.map((member, index) => (
                      <div key={member.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">{280 + index * 40} pts</div>
                            <div className="text-xs text-muted-foreground">{member.streak} day streak</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>Tasks</span>
                              <span>{18 - index}/21</span>
                            </div>
                            <Progress value={((18 - index) / 21) * 100} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>Quizzes</span>
                              <span>{12 - index}/14</span>
                            </div>
                            <Progress value={((12 - index) / 14) * 100} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>Quests</span>
                              <span>{5 - Math.floor(index / 2)}/7</span>
                            </div>
                            <Progress value={((5 - Math.floor(index / 2)) / 7) * 100} className="h-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="fixed inset-0 z-40 bg-background md:relative md:inset-auto md:z-auto">
              <div className="flex flex-col h-screen md:h-96">
                {/* Mobile Calendar Header */}
                <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 safe-area-top">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("overview")}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Calendar className="h-5 w-5" />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm truncate">{pod.name} Calendar</h2>
                        <p className="text-xs text-muted-foreground">Upcoming sessions and events</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleOpenCalendar} className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Pod Calendar</h3>
                    <p className="text-muted-foreground mb-4 text-sm lg:text-base">View upcoming sessions and events</p>
                    <Button onClick={handleOpenCalendar} className="bg-primary hover:bg-primary/90">
                      Open Full Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Whiteboard */}
      <InteractiveWhiteboard
        isActive={isInSession}
        isVisible={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
      />

      {/* Custom Pod Navigation for Mobile */}
      <PodNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default function PodPage() {
  return <PodPageComponent />
}
