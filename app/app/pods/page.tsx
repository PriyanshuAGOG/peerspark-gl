"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Filter,
  Calendar,
  Video,
  MessageSquare,
  BookOpen,
  Target,
  Crown,
  Zap,
  Globe,
  Award,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const MY_PODS = [
  {
    id: "dsa-masters",
    name: "DSA Masters",
    description: "Daily coding practice and algorithm discussions with industry experts",
    category: "Programming",
    members: 1247,
    rating: 4.9,
    difficulty: "Advanced",
    tags: ["DSA", "Algorithms", "Interview Prep"],
    mentor: "Rahul Sharma",
    nextSession: "Today 8:00 PM",
    progress: 75,
    streak: 15,
    role: "Member",
    cover: "/placeholder.svg?height=120&width=200&text=DSA+Masters",
    isActive: true,
  },
  {
    id: "neet-biology",
    name: "NEET Biology Squad",
    description: "Comprehensive biology preparation for NEET with expert guidance",
    category: "Medical",
    members: 892,
    rating: 4.8,
    difficulty: "Intermediate",
    tags: ["Biology", "NEET", "Medical Entrance"],
    mentor: "Dr. Priya Singh",
    nextSession: "Tomorrow 6:00 PM",
    progress: 60,
    streak: 8,
    role: "Member",
    cover: "/placeholder.svg?height=120&width=200&text=Biology+Squad",
    isActive: true,
  },
  {
    id: "design-thinking",
    name: "Design Thinking Hub",
    description: "Learn UI/UX design principles and create amazing user experiences",
    category: "Design",
    members: 634,
    rating: 4.7,
    difficulty: "Beginner",
    tags: ["UI/UX", "Design", "Figma"],
    mentor: "Sarah Johnson",
    nextSession: "Friday 7:00 PM",
    progress: 40,
    streak: 5,
    role: "Leader",
    cover: "/placeholder.svg?height=120&width=200&text=Design+Hub",
    isActive: false,
  },
]

const EXPLORE_PODS = [
  {
    id: "react-mastery",
    name: "React Mastery",
    description: "Master React.js with hands-on projects and real-world applications",
    category: "Programming",
    members: 2156,
    rating: 4.9,
    difficulty: "Intermediate",
    tags: ["React", "JavaScript", "Frontend"],
    mentor: "Alex Chen",
    price: "Free",
    cover: "/placeholder.svg?height=120&width=200&text=React+Mastery",
    isPremium: false,
  },
  {
    id: "machine-learning",
    name: "ML Fundamentals",
    description: "Introduction to machine learning concepts and practical implementations",
    category: "AI/ML",
    members: 1834,
    rating: 4.8,
    difficulty: "Advanced",
    tags: ["Machine Learning", "Python", "AI"],
    mentor: "Dr. Raj Patel",
    price: "₹299/month",
    cover: "/placeholder.svg?height=120&width=200&text=ML+Fundamentals",
    isPremium: true,
  },
  {
    id: "spanish-conversation",
    name: "Spanish Conversation Circle",
    description: "Practice Spanish conversation with native speakers and fellow learners",
    category: "Languages",
    members: 567,
    rating: 4.6,
    difficulty: "Beginner",
    tags: ["Spanish", "Conversation", "Language"],
    mentor: "Maria Rodriguez",
    price: "Free",
    cover: "/placeholder.svg?height=120&width=200&text=Spanish+Circle",
    isPremium: false,
  },
  {
    id: "data-science",
    name: "Data Science Bootcamp",
    description: "Complete data science curriculum with real industry projects",
    category: "Data Science",
    members: 3421,
    rating: 4.9,
    difficulty: "Advanced",
    tags: ["Data Science", "Python", "Analytics"],
    mentor: "Dr. Lisa Wang",
    price: "₹499/month",
    cover: "/placeholder.svg?height=120&width=200&text=Data+Science",
    isPremium: true,
  },
  {
    id: "creative-writing",
    name: "Creative Writing Workshop",
    description: "Develop your writing skills with guided exercises and peer feedback",
    category: "Writing",
    members: 423,
    rating: 4.5,
    difficulty: "Beginner",
    tags: ["Writing", "Creative", "Literature"],
    mentor: "Emma Thompson",
    price: "Free",
    cover: "/placeholder.svg?height=120&width=200&text=Creative+Writing",
    isPremium: false,
  },
  {
    id: "blockchain-dev",
    name: "Blockchain Development",
    description: "Learn blockchain technology and smart contract development",
    category: "Programming",
    members: 1245,
    rating: 4.7,
    difficulty: "Advanced",
    tags: ["Blockchain", "Solidity", "Web3"],
    mentor: "John Crypto",
    price: "₹399/month",
    cover: "/placeholder.svg?height=120&width=200&text=Blockchain+Dev",
    isPremium: true,
  },
]

const CATEGORIES = [
  { name: "All", count: 150, icon: Globe },
  { name: "Programming", count: 45, icon: BookOpen },
  { name: "Design", count: 23, icon: Target },
  { name: "Medical", count: 18, icon: Award },
  { name: "Languages", count: 12, icon: MessageSquare },
  { name: "Business", count: 15, icon: TrendingUp },
]

export default function PodsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [activeTab, setActiveTab] = useState("my-pods")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSchedulerDialogOpen, setIsSchedulerDialogOpen] = useState(false)
  const [newPod, setNewPod] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "",
    tags: "",
    isPublic: true,
  })
  const [schedulerForm, setSchedulerForm] = useState({
    subject: "",
    duration: "",
    dailyStudyTime: "",
    reminderTime: "",
    podId: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleJoinPod = (podId: string) => {
    router.push(`/app/pods/${podId}`)
  }

  const handleCreatePod = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCreatePodSubmit = () => {
    if (!newPod.name || !newPod.description || !newPod.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Pod Created!",
      description: `${newPod.name} has been created successfully`,
    })

    // Reset form and close dialog
    setNewPod({
      name: "",
      description: "",
      category: "",
      difficulty: "",
      tags: "",
      isPublic: true,
    })
    setIsCreateDialogOpen(false)

    // Simulate navigation to new pod
    setTimeout(() => {
      router.push(`/app/pods/new-pod-${Date.now()}`)
    }, 1000)
  }

  const handleJoinExplorePod = (podId: string, podName: string) => {
    toast({
      title: "Joining Pod",
      description: `Welcome to ${podName}! You can now access all pod resources.`,
    })
    // Add pod to user's pods and redirect
    setTimeout(() => {
      router.push(`/app/pods/${podId}`)
    }, 1000)
  }

  const handlePodChat = (podId: string) => {
    router.push(`/app/chat?room=${podId}`)
    toast({
      title: "Opening Chat",
      description: "Redirecting to pod chat...",
    })
  }

  const handlePodCalendar = (podId: string) => {
    router.push(`/app/calendar?pod=${podId}`)
    toast({
      title: "Opening Calendar",
      description: "Viewing pod schedule...",
    })
  }

  const handleOpenScheduler = (podId: string, podName: string) => {
    setSchedulerForm({ ...schedulerForm, podId, subject: podName })
    setIsSchedulerDialogOpen(true)
  }

  const handleGenerateSchedule = async () => {
    if (
      !schedulerForm.subject ||
      !schedulerForm.duration ||
      !schedulerForm.dailyStudyTime ||
      !schedulerForm.reminderTime
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Call the backend API
      const response = await fetch("/api/pods/schedule/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId: schedulerForm.podId,
          subject: schedulerForm.subject,
          duration: Number.parseInt(schedulerForm.duration),
          dailyStudyTime: Number.parseInt(schedulerForm.dailyStudyTime),
          reminderTime: schedulerForm.reminderTime,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate schedule")
      }

      const data = await response.json()

      toast({
        title: "Schedule Generated!",
        description: `AI-powered roadmap created for ${schedulerForm.subject}. Check your calendar for daily tasks.`,
      })

      // Reset form and close dialog
      setSchedulerForm({
        subject: "",
        duration: "",
        dailyStudyTime: "",
        reminderTime: "",
        podId: "",
      })
      setIsSchedulerDialogOpen(false)

      // Navigate to calendar view
      router.push(`/app/calendar?pod=${schedulerForm.podId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredExplorePods = EXPLORE_PODS.filter((pod) => {
    const matchesSearch =
      pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || pod.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">My Pods</h1>
            <p className="text-sm text-muted-foreground">Your learning communities</p>
          </div>
          <Button size="sm" onClick={handleCreatePod} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Study Pods</h1>
              <p className="text-muted-foreground">Join communities and learn together</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleCreatePod} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Pod
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 md:pb-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-secondary/50 rounded-lg p-1 max-w-fit">
            {[
              { value: "my-pods", label: "My Pods", icon: Users },
              { value: "explore", label: "Explore", icon: Search },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
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

        {/* My Pods Tab */}
        {activeTab === "my-pods" && (
          <div className="space-y-6">
            {/* My Pods Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MY_PODS.map((pod) => (
                <Card key={pod.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="relative">
                    <img
                      src={pod.cover || "/placeholder.svg"}
                      alt={pod.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getDifficultyColor(pod.difficulty)}>{pod.difficulty}</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      {pod.role === "Leader" && (
                        <Badge className="bg-yellow-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Leader
                        </Badge>
                      )}
                      {pod.isActive && <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{pod.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pod.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {pod.members.toLocaleString()}
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {pod.rating}
                          </span>
                        </div>
                        <Badge variant="outline">{pod.category}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">{pod.progress}%</span>
                        </div>
                        <Progress value={pod.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {pod.nextSession}
                        </span>
                        <span className="flex items-center">
                          <Zap className="w-4 h-4 mr-1 text-orange-500" />
                          {pod.streak} day streak
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {pod.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button onClick={() => handleJoinPod(pod.id)} className="flex-1 bg-primary hover:bg-primary/90">
                          <Video className="w-4 h-4 mr-2" />
                          Enter Pod
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-transparent"
                          onClick={() => handlePodChat(pod.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-transparent"
                          onClick={() => handleOpenScheduler(pod.id, pod.name)}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Explore Tab */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search pods, topics, or mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.name
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Explore Pods Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExplorePods.map((pod) => (
                <Card key={pod.id} className="hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={pod.cover || "/placeholder.svg"}
                      alt={pod.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getDifficultyColor(pod.difficulty)}>{pod.difficulty}</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      {pod.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{pod.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pod.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {pod.members.toLocaleString()}
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {pod.rating}
                          </span>
                        </div>
                        <Badge variant="outline">{pod.category}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Mentor: {pod.mentor}</span>
                        <span className={`font-semibold ${pod.price === "Free" ? "text-green-600" : "text-primary"}`}>
                          {pod.price}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {pod.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          onClick={() => handleJoinExplorePod(pod.id, pod.name)}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Join Pod
                        </Button>
                        <Button variant="outline" size="icon" className="bg-transparent">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredExplorePods.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pods found</h3>
                <p className="text-muted-foreground">Try adjusting your search or browse different categories</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Pod Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Create New Pod</DialogTitle>
            <DialogDescription>Start a new learning community and invite others to join</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pod-name">Pod Name *</Label>
              <Input
                id="pod-name"
                placeholder="e.g., Advanced React Patterns"
                value={newPod.name}
                onChange={(e) => setNewPod({ ...newPod, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pod-description">Description *</Label>
              <Textarea
                id="pod-description"
                placeholder="Describe what your pod is about..."
                value={newPod.description}
                onChange={(e) => setNewPod({ ...newPod, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pod-category">Category *</Label>
                <Select value={newPod.category} onValueChange={(value) => setNewPod({ ...newPod, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pod-difficulty">Difficulty</Label>
                <Select
                  value={newPod.difficulty}
                  onValueChange={(value) => setNewPod({ ...newPod, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="pod-tags">Tags (comma separated)</Label>
              <Input
                id="pod-tags"
                placeholder="e.g., React, JavaScript, Frontend"
                value={newPod.tags}
                onChange={(e) => setNewPod({ ...newPod, tags: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePodSubmit}>Create Pod</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pod Scheduler Dialog */}
      <Dialog open={isSchedulerDialogOpen} onOpenChange={setIsSchedulerDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              AI Pod Scheduler
            </DialogTitle>
            <DialogDescription>
              Generate a personalized learning roadmap with daily tasks, quizzes, and challenges
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scheduler-subject">Subject/Topic *</Label>
              <Input
                id="scheduler-subject"
                placeholder="e.g., Data Structures & Algorithms"
                value={schedulerForm.subject}
                onChange={(e) => setSchedulerForm({ ...schedulerForm, subject: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduler-duration">Duration (days) *</Label>
                <Select
                  value={schedulerForm.duration}
                  onValueChange={(value) => setSchedulerForm({ ...schedulerForm, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                    <SelectItem value="60">2 Months</SelectItem>
                    <SelectItem value="90">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheduler-study-time">Daily Study Time *</Label>
                <Select
                  value={schedulerForm.dailyStudyTime}
                  onValueChange={(value) => setSchedulerForm({ ...schedulerForm, dailyStudyTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hours/day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="5">5+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scheduler-reminder">Daily Reminder Time *</Label>
              <Input
                id="scheduler-reminder"
                type="time"
                value={schedulerForm.reminderTime}
                onChange={(e) => setSchedulerForm({ ...schedulerForm, reminderTime: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">You'll receive daily notifications at this time</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">What you'll get:</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Daily learning tasks and topics</li>
                <li>• Interactive quizzes and challenges</li>
                <li>• Progress tracking and streaks</li>
                <li>• Smart reminders and notifications</li>
                <li>• Pod-wide calendar integration</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsSchedulerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateSchedule} className="bg-primary hover:bg-primary/90">
              <Zap className="w-4 h-4 mr-2" />
              Generate Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
