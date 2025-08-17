"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share2, Bookmark, Search, TrendingUp, Users, Filter, MoreHorizontal, User, Flag } from 'lucide-react'
import { CreatePostModal } from "@/components/create-post-modal"
import { MobileHeader } from "@/components/mobile-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Post {
  id: string
  title?: string
  content: string
  author: {
    name: string
    avatar: string
    username: string
  }
  timestamp: string
  likes: number
  comments: number
  shares: number
  tags: string[]
  pod?: {
    id: string
    name: string
    members: number
  }
  attachments?: string[]
  isLiked: boolean
  isBookmarked: boolean
}

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    title: "Just completed my first system design interview!",
    content:
      "After months of preparation with the System Design pod, I finally nailed my first system design interview at a FAANG company! The key was practicing with real scenarios and getting feedback from experienced engineers. Here are my top 3 tips:\n\n1. Start with requirements gathering\n2. Think about scale from the beginning\n3. Don't forget about monitoring and logging\n\nThanks to everyone in the pod who helped me practice! 🚀",
    author: {
      name: "Arjun Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@arjun_codes",
    },
    timestamp: "2h",
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ["SystemDesign", "Interview", "FAANG", "Success"],
    pod: {
      id: "system-design",
      name: "System Design Masters",
      members: 678,
    },
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "2",
    content:
      "Quick question for the DSA community: What's the best approach to solve sliding window problems? I keep getting confused with the two-pointer technique. Any good resources or practice problems you'd recommend?",
    author: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@priya_dev",
    },
    timestamp: "4h",
    likes: 12,
    comments: 15,
    shares: 2,
    tags: ["DSA", "SlidingWindow", "Help", "Algorithms"],
    pod: {
      id: "dsa-masters",
      name: "DSA Masters",
      members: 1247,
    },
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "3",
    title: "My 100 Days of Code Journey - Day 50! 🎉",
    content:
      "Halfway through my 100 Days of Code challenge! Here's what I've learned so far:\n\n✅ Built 5 full-stack projects\n✅ Learned React, Node.js, and MongoDB\n✅ Contributed to 3 open-source projects\n✅ Made amazing friends in the Web Dev Pro pod\n\nThe consistency has been game-changing. Even on tough days, coding for just 30 minutes kept the momentum going. To anyone thinking about starting - just begin! 💪",
    author: {
      name: "Karan Singh",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@karan_builds",
    },
    timestamp: "6h",
    likes: 45,
    comments: 12,
    shares: 8,
    tags: ["100DaysOfCode", "WebDev", "Motivation", "Progress"],
    pod: {
      id: "web-dev-pro",
      name: "Web Dev Pro",
      members: 892,
    },
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "4",
    content:
      "Just discovered this amazing resource for learning machine learning! 'Hands-On Machine Learning' by Aurélien Géron is absolutely fantastic. The practical examples and clear explanations make complex concepts so much easier to understand. Highly recommend it to anyone in the AI/ML space! 📚🤖",
    author: {
      name: "Neha Gupta",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@neha_ai",
    },
    timestamp: "8h",
    likes: 18,
    comments: 6,
    shares: 4,
    tags: ["MachineLearning", "BookRecommendation", "AI", "Learning"],
    pod: {
      id: "ai-ml-hub",
      name: "AI/ML Hub",
      members: 1456,
    },
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "5",
    title: "Free Mock Interview Sessions This Weekend!",
    content:
      "Hey everyone! I'm organizing free mock interview sessions this weekend for anyone preparing for tech interviews. We'll cover:\n\n🔸 Coding interviews (DSA focus)\n🔸 System design discussions\n🔸 Behavioral questions\n🔸 Resume review\n\nComment below if you're interested! Limited spots available. Let's help each other succeed! 🤝",
    author: {
      name: "Rahul Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@rahul_mentor",
    },
    timestamp: "12h",
    likes: 67,
    comments: 23,
    shares: 15,
    tags: ["MockInterview", "Free", "Community", "InterviewPrep"],
    isLiked: true,
    isBookmarked: true,
  },
]

const TRENDING_TOPICS = [
  { tag: "SystemDesign", posts: 45 },
  { tag: "DSA", posts: 89 },
  { tag: "WebDev", posts: 67 },
  { tag: "MachineLearning", posts: 34 },
  { tag: "InterviewPrep", posts: 56 },
]

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleBookmark = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))

    const post = posts.find((p) => p.id === postId)
    toast({
      title: post?.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: post?.isBookmarked ? "Post removed from your saved items" : "Post saved to your bookmarks",
    })
  }

  const handleShare = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      navigator.clipboard.writeText(`https://peerspark.com/post/${postId}`)
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      })
    }
  }

  const handleComment = (postId: string) => {
    toast({
      title: "Comments",
      description: "Comment feature coming soon!",
    })
  }

  const handlePostClick = (username: string) => {
    router.push(`/app/profile/${username.replace('@', '')}`)
  }

  const handleReportPost = (postId: string) => {
    toast({
      title: "Post Reported",
      description: "Thank you for reporting. We'll review this content.",
    })
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "following" && Math.random() > 0.5) || // Simulate following
      (activeTab === "pods" && post.pod)

    return matchesSearch && matchesTab
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Desktop Header */}
      <div className="hidden md:block p-4 md:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Feed</h1>
            <p className="text-muted-foreground">Stay updated with your learning community</p>
          </div>

          {/* Desktop Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts, people, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="pods">My Pods</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden px-4 py-2 border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs">
              Following
            </TabsTrigger>
            <TabsTrigger value="pods" className="text-xs">
              Pods
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20 md:pb-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow border-0 md:border shadow-sm">
                  <CardHeader className="pb-3 px-4 md:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                          onClick={() => handlePostClick(post.author.username)}
                        >
                          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                          <AvatarFallback>
                            {post.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 
                              className="font-semibold text-sm cursor-pointer hover:underline" 
                              onClick={() => handlePostClick(post.author.username)}
                            >
                              {post.author.name}
                            </h4>
                            <span className="text-muted-foreground text-sm hidden md:inline">
                              {post.author.username}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{post.timestamp}</span>
                            {post.pod && (
                              <>
                                <span>•</span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-muted"
                                  onClick={() => router.push(`/app/pods/${post.pod?.id}`)}
                                >
                                  <Users className="w-3 h-3 mr-1" />
                                  {post.pod.name}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBookmark(post.id)}
                          className={`h-8 w-8 ${post.isBookmarked ? "text-yellow-500" : ""}`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePostClick(post.author.username)}>
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(post.id)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBookmark(post.id)}>
                              <Bookmark className="w-4 h-4 mr-2" />
                              {post.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleReportPost(post.id)}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Report Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 md:px-6">
                    {post.title && <h3 className="font-semibold text-lg mb-2">{post.title}</h3>}
                    <div className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-1 md:space-x-4">
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
                          onClick={() => handleComment(post.id)}
                          className="hover:text-blue-500 h-8 px-2 md:px-3"
                        >
                          <MessageCircle className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="text-xs md:text-sm">{post.comments}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post.id)}
                          className="hover:text-green-500 h-8 px-2 md:px-3"
                        >
                          <Share2 className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="text-xs md:text-sm hidden md:inline">{post.shares}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-semibold">Trending Topics</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {TRENDING_TOPICS.map((topic) => (
                  <div key={topic.tag} className="flex items-center justify-between">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      #{topic.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Pods */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold">Suggested Pods</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">React Masters</h4>
                      <p className="text-xs text-muted-foreground">Advanced React patterns</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Python Pro</h4>
                      <p className="text-xs text-muted-foreground">Python development</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">DevOps Hub</h4>
                      <p className="text-xs text-muted-foreground">Cloud & infrastructure</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Create Post Modal */}
      <CreatePostModal onPostCreated={handlePostCreated} />
    </div>
  )
}
