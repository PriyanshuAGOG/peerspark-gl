"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MapPin,
  Calendar,
  LinkIcon,
  Edit,
  MessageSquare,
  UserPlus,
  Target,
  BookOpen,
  Users,
  Clock,
  Award,
  TrendingUp,
  Heart,
  Share2,
  Settings,
  Shield,
  Bell,
  Key,
  User,
  Upload,
  Save,
  Download,
  Trash2,
  ArrowLeft,
  Bookmark,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Flame,
  Star,
  Trophy,
  CalendarIcon,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const USER_PROFILE = {
  name: "Alex Johnson",
  username: "@alex_codes",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "Full-stack developer passionate about learning and sharing knowledge. Currently diving deep into system design and distributed systems.",
  location: "San Francisco, CA",
  website: "alexjohnson.dev",
  joinedDate: "March 2023",
  followers: 1247,
  following: 892,
  isFollowing: false,
  stats: {
    studyStreak: 45,
    totalHours: 324,
    podsJoined: 8,
    resourcesShared: 23,
    postsCreated: 67,
    helpfulVotes: 189,
    questsCompleted: 127,
    dailyTasksCompleted: 89,
    totalPoints: 2450,
    currentLevel: 12,
    weeklyGoalProgress: 78,
  },
}

const QUEST_PROGRESS = {
  currentStreak: 15,
  longestStreak: 45,
  weeklyStats: {
    tasksCompleted: 18,
    tasksTotal: 21,
    quizzesCompleted: 12,
    quizzesTotal: 14,
    questsCompleted: 5,
    questsTotal: 7,
  },
  monthlyProgress: [
    { month: "Jan", completed: 85, total: 100 },
    { month: "Feb", completed: 92, total: 100 },
    { month: "Mar", completed: 78, total: 100 },
    { month: "Apr", completed: 95, total: 100 },
  ],
  recentActivity: [
    {
      id: "1",
      type: "quest",
      title: "React Hooks Deep Dive",
      status: "completed",
      points: 150,
      timestamp: "2 hours ago",
      difficulty: "Advanced",
    },
    {
      id: "2",
      type: "quiz",
      title: "JavaScript Fundamentals Quiz",
      status: "completed",
      points: 75,
      timestamp: "1 day ago",
      difficulty: "Intermediate",
    },
    {
      id: "3",
      type: "task",
      title: "Daily Reading: System Design",
      status: "completed",
      points: 25,
      timestamp: "1 day ago",
      difficulty: "Beginner",
    },
    {
      id: "4",
      type: "quest",
      title: "Build a REST API",
      status: "in-progress",
      points: 200,
      timestamp: "2 days ago",
      difficulty: "Advanced",
    },
    {
      id: "5",
      type: "task",
      title: "Code Review Practice",
      status: "missed",
      points: 50,
      timestamp: "3 days ago",
      difficulty: "Intermediate",
    },
  ],
  skillProgress: [
    { skill: "React", level: 8, progress: 75, totalXP: 1200 },
    { skill: "Node.js", level: 6, progress: 40, totalXP: 850 },
    { skill: "System Design", level: 4, progress: 60, totalXP: 420 },
    { skill: "TypeScript", level: 7, progress: 20, totalXP: 980 },
    { skill: "Database Design", level: 5, progress: 80, totalXP: 640 },
  ],
}

const USER_ACHIEVEMENTS = [
  {
    id: "1",
    title: "Study Streak Master",
    description: "Maintained a 30+ day study streak",
    icon: "🔥",
    earned: true,
    progress: 100,
    rarity: "Epic",
  },
  {
    id: "2",
    title: "Knowledge Sharer",
    description: "Shared 20+ helpful resources",
    icon: "📚",
    earned: true,
    progress: 100,
    rarity: "Rare",
  },
  {
    id: "3",
    title: "Community Helper",
    description: "Received 100+ helpful votes",
    icon: "🤝",
    earned: true,
    progress: 100,
    rarity: "Rare",
  },
  {
    id: "4",
    title: "Pod Leader",
    description: "Successfully led a study pod",
    icon: "👑",
    earned: false,
    progress: 75,
    rarity: "Legendary",
  },
  {
    id: "5",
    title: "Mentor",
    description: "Helped 50+ students achieve their goals",
    icon: "🎓",
    earned: false,
    progress: 60,
    rarity: "Epic",
  },
  {
    id: "6",
    title: "Code Warrior",
    description: "Solved 500+ coding problems",
    icon: "⚔️",
    earned: false,
    progress: 45,
    rarity: "Legendary",
  },
  {
    id: "7",
    title: "Quest Master",
    description: "Completed 100+ coding quests",
    icon: "🏆",
    earned: true,
    progress: 100,
    rarity: "Epic",
  },
  {
    id: "8",
    title: "Daily Warrior",
    description: "Completed daily tasks for 7 days straight",
    icon: "⚡",
    earned: true,
    progress: 100,
    rarity: "Rare",
  },
]

const USER_POSTS = [
  {
    id: "1",
    title: "My Journey Learning System Design",
    content:
      "After 6 months of consistent study, I finally feel confident about system design interviews. Here's what worked for me:\n\n1. Started with basics - scalability, reliability, availability\n2. Practiced with real-world examples\n3. Joined the System Design pod for peer learning\n4. Built actual projects to apply concepts\n\nThe key was consistent practice and getting feedback from experienced engineers.",
    timestamp: "2 days ago",
    likes: 34,
    comments: 12,
    shares: 8,
    tags: ["SystemDesign", "Learning", "Interview"],
    isLiked: false,
    isBookmarked: true,
    author: {
      id: "alex_codes",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "2",
    content:
      "Quick tip for anyone learning React: Use the React Developer Tools browser extension. It's a game-changer for debugging component state and props. You can inspect the component tree, see state changes in real-time, and even time-travel debug! 🚀",
    timestamp: "5 days ago",
    likes: 28,
    comments: 7,
    shares: 15,
    tags: ["React", "Tips", "Development"],
    isLiked: true,
    isBookmarked: false,
    author: {
      id: "alex_codes",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
]

const USER_ACTIVITY = [
  {
    id: "1",
    type: "achievement",
    message: "Earned the 'Study Streak Master' achievement",
    timestamp: "2 hours ago",
    icon: "🏆",
  },
  {
    id: "2",
    type: "post",
    message: "Created a new post about system design learning",
    timestamp: "2 days ago",
    icon: "📝",
  },
  {
    id: "3",
    type: "pod",
    message: "Joined the 'Advanced React Patterns' pod",
    timestamp: "3 days ago",
    icon: "👥",
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")
  const [isFollowing, setIsFollowing] = useState(USER_PROFILE.isFollowing)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isOwnProfile] = useState(true)

  // Profile edit state
  const [profileData, setProfileData] = useState({
    name: USER_PROFILE.name,
    bio: USER_PROFILE.bio,
    location: USER_PROFILE.location,
    website: USER_PROFILE.website,
  })

  // Settings state
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showStudyStats: true,
    allowPodInvites: true,
    showOnlineStatus: false,
    allowDirectMessages: true,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    podUpdates: true,
    socialNotifications: false,
    weeklyDigest: true,
  })

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing ? `You unfollowed ${USER_PROFILE.name}` : `You are now following ${USER_PROFILE.name}`,
    })
  }

  const handleMessage = () => {
    router.push("/app/chat")
    toast({
      title: "Message",
      description: "Opening chat with " + USER_PROFILE.name,
    })
  }

  const handleEditProfile = () => {
    setIsEditDialogOpen(true)
  }

  const handleSaveProfile = () => {
    setIsEditDialogOpen(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const handleSettings = () => {
    router.push("/app/settings")
  }

  const handleLike = (postId: string) => {
    const post = USER_POSTS.find((p) => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
      toast({
        title: post.isLiked ? "Post Liked" : "Like Removed",
        description: post.isLiked ? "Added to your liked posts" : "Removed from liked posts",
      })
    }
  }

  const handleComment = (postId: string) => {
    router.push(`/app/post/${postId}#comments`)
    toast({
      title: "Comments",
      description: "Opening post comments...",
    })
  }

  const handleBookmark = (postId: string) => {
    const post = USER_POSTS.find((p) => p.id === postId)
    if (post) {
      post.isBookmarked = !post.isBookmarked
      toast({
        title: post.isBookmarked ? "Post Saved" : "Bookmark Removed",
        description: post.isBookmarked ? "Added to your saved posts" : "Removed from saved posts",
      })
    }
  }

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`https://peerspark.com/post/${postId}`)
    toast({
      title: "Shared",
      description: "Post link copied to clipboard!",
    })
  }

  const handlePostClick = (authorId: string) => {
    if (authorId !== "alex_codes") {
      router.push(`/app/profile/${authorId}`)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "text-gray-500"
      case "Rare":
        return "text-blue-500"
      case "Epic":
        return "text-purple-500"
      case "Legendary":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "missed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/feed")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/settings")}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Profile Header */}
        <Card className="mb-4 md:mb-8">
          <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col space-y-4">
              {/* Mobile Profile Layout */}
              <div className="md:hidden space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={USER_PROFILE.avatar || "/placeholder.svg"} alt={USER_PROFILE.name} />
                    <AvatarFallback className="text-xl">
                      {USER_PROFILE.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold">{USER_PROFILE.name}</h1>
                    <p className="text-muted-foreground">{USER_PROFILE.username}</p>
                    <div className="flex items-center space-x-4 text-sm mt-2">
                      <div>
                        <span className="font-semibold">{USER_PROFILE.following.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">Following</span>
                      </div>
                      <div>
                        <span className="font-semibold">{USER_PROFILE.followers.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">Followers</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">{USER_PROFILE.bio}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{USER_PROFILE.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-3 h-3" />
                    <span className="text-primary">{USER_PROFILE.website}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {USER_PROFILE.joinedDate}</span>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="flex space-x-2">
                  {isOwnProfile ? (
                    <>
                      <Button onClick={handleEditProfile} variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-3 h-3 mr-2" />
                        Edit Profile
                      </Button>
                      <Button onClick={handleSettings} size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-2" />
                        Settings
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleMessage} variant="outline" size="sm" className="flex-1 bg-transparent">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Message
                      </Button>
                      <Button
                        onClick={handleFollow}
                        size="sm"
                        className={`flex-1 ${isFollowing ? "bg-muted hover:bg-muted/80 text-muted-foreground" : ""}`}
                      >
                        <UserPlus className="w-3 h-3 mr-2" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Desktop Profile Layout */}
              <div className="hidden md:flex items-start space-x-6">
                <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
                  <AvatarImage src={USER_PROFILE.avatar || "/placeholder.svg"} alt={USER_PROFILE.name} />
                  <AvatarFallback className="text-2xl">
                    {USER_PROFILE.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{USER_PROFILE.name}</h1>
                    <p className="text-muted-foreground text-lg">{USER_PROFILE.username}</p>
                  </div>

                  <p className="text-muted-foreground max-w-2xl">{USER_PROFILE.bio}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{USER_PROFILE.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-primary cursor-pointer hover:underline">{USER_PROFILE.website}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {USER_PROFILE.joinedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="cursor-pointer hover:underline">
                      <span className="font-semibold">{USER_PROFILE.following.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">Following</span>
                    </div>
                    <div className="cursor-pointer hover:underline">
                      <span className="font-semibold">{USER_PROFILE.followers.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">Followers</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleEditProfile} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button onClick={handleMessage} variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={handleFollow}
                    className={isFollowing ? "bg-muted hover:bg-muted/80 text-muted-foreground" : ""}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-6 mb-4 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Target className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.studyStreak}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.totalHours}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Study Hours</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.podsJoined}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pods Joined</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.resourcesShared}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Resources Shared</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
                  <Trophy className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.questsCompleted}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Quests Done</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-full">
                  <Star className="w-4 h-4 md:w-6 md:h-6 text-pink-600" />
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold">{USER_PROFILE.stats.totalPoints}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <div className="border-b border-border">
            <div className="flex space-x-0">
              {[
                { value: "posts", label: "Posts", icon: "📝", count: USER_POSTS.length },
                {
                  value: "achievements",
                  label: "Achievements",
                  icon: "🏆",
                  count: USER_ACHIEVEMENTS.filter((a) => a.earned).length,
                },
                { value: "activity", label: "Activity", icon: "⚡", count: USER_ACTIVITY.length },
                { value: "progress", label: "Progress", icon: "📈", count: null },
                { value: "stats", label: "Stats", icon: "📊", count: null },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 flex flex-col items-center py-3 px-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.value
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-lg">{tab.icon}</span>
                    {tab.count !== null && (
                      <Badge variant="secondary" className="text-xs h-5 min-w-5 px-1">
                        {tab.count}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="posts" className="space-y-4">
            {USER_POSTS.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="w-8 h-8 cursor-pointer" onClick={() => handlePostClick(post.author.id)}>
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p
                        className="font-medium text-sm cursor-pointer hover:underline"
                        onClick={() => handlePostClick(post.author.id)}
                      >
                        {post.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>

                  {post.title && <h3 className="font-semibold text-base md:text-lg mb-3">{post.title}</h3>}
                  <div className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`${post.isLiked ? "text-red-500" : ""} hover:text-red-500 h-8 px-2 md:px-3`}
                      >
                        <Heart className={`w-4 h-4 mr-1 md:mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                        <span className="text-xs md:text-sm">{post.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-blue-500 h-8 px-2 md:px-3"
                        onClick={() => handleComment(post.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">{post.comments}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="hover:text-green-500 h-8 px-2 md:px-3"
                      >
                        <Share2 className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">{post.shares}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(post.id)}
                        className={`${post.isBookmarked ? "text-yellow-500" : ""} hover:text-yellow-500 h-8 px-2 md:px-3`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {USER_ACHIEVEMENTS.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${achievement.earned ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10" : "opacity-75"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{achievement.title}</h4>
                          <Badge
                            variant={achievement.earned ? "default" : "secondary"}
                            className={`text-xs ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-3">
            {USER_ACTIVITY.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Current Streak & Weekly Overview */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Flame className="w-4 h-4 mr-2 text-orange-500" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-orange-500">{QUEST_PROGRESS.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Days in a row</div>
                    <div className="text-xs text-muted-foreground">Longest: {QUEST_PROGRESS.longestStreak} days</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Tasks</span>
                    <span className="text-sm font-medium">
                      {QUEST_PROGRESS.weeklyStats.tasksCompleted}/{QUEST_PROGRESS.weeklyStats.tasksTotal}
                    </span>
                  </div>
                  <Progress
                    value={(QUEST_PROGRESS.weeklyStats.tasksCompleted / QUEST_PROGRESS.weeklyStats.tasksTotal) * 100}
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quizzes</span>
                    <span className="text-sm font-medium">
                      {QUEST_PROGRESS.weeklyStats.quizzesCompleted}/{QUEST_PROGRESS.weeklyStats.quizzesTotal}
                    </span>
                  </div>
                  <Progress
                    value={
                      (QUEST_PROGRESS.weeklyStats.quizzesCompleted / QUEST_PROGRESS.weeklyStats.quizzesTotal) * 100
                    }
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quests</span>
                    <span className="text-sm font-medium">
                      {QUEST_PROGRESS.weeklyStats.questsCompleted}/{QUEST_PROGRESS.weeklyStats.questsTotal}
                    </span>
                  </div>
                  <Progress
                    value={(QUEST_PROGRESS.weeklyStats.questsCompleted / QUEST_PROGRESS.weeklyStats.questsTotal) * 100}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Brain className="w-4 h-4 mr-2 text-purple-500" />
                  Skill Progress
                </CardTitle>
                <CardDescription>Your learning progress across different skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {QUEST_PROGRESS.skillProgress.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {skill.level}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{skill.totalXP} XP</span>
                      </div>
                      <Progress value={skill.progress} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quest Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest quest completions and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {QUEST_PROGRESS.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
                              {activity.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">+{activity.points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  Monthly Progress
                </CardTitle>
                <CardDescription>Your completion rate over the past months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {QUEST_PROGRESS.monthlyProgress.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-sm text-muted-foreground">{month.completed}% completion</span>
                      </div>
                      <Progress value={month.completed} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Study Consistency</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <Progress value={92} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Goal Achievement</span>
                        <span className="text-sm text-muted-foreground">78%</span>
                      </div>
                      <Progress value={78} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Quest Completion Rate</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Award className="w-4 h-4 mr-2" />
                    Achievements Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-yellow-600">
                        {USER_ACHIEVEMENTS.filter((a) => a.earned).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Earned</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">
                        {USER_ACHIEVEMENTS.filter((a) => !a.earned).length}
                      </div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Make changes to your profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={USER_PROFILE.avatar || "/placeholder.svg"} />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-md mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings & Preferences</DialogTitle>
            <DialogDescription>Manage your account settings and preferences.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Privacy Settings */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.profilePublic}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, profilePublic: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Study Statistics</Label>
                    <p className="text-sm text-muted-foreground">Display your study hours and streaks</p>
                  </div>
                  <Switch
                    checked={privacySettings.showStudyStats}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showStudyStats: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Pod Invitations</Label>
                    <p className="text-sm text-muted-foreground">Let others invite you to study pods</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowPodInvites}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowPodInvites: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pod Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications about pod activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.podUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, podUpdates: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsSettingsDialogOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
