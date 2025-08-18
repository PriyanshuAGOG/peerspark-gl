"use client"

import { useState, useEffect } from "react"
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
import { Heart, MessageCircle, Share2, Bookmark, Search, TrendingUp, Users, Filter, MoreHorizontal, User, Flag, Loader2 } from 'lucide-react'
import { PostCard } from "@/components/post-card"
import { CreatePostModal } from "@/components/create-post-modal"
import { MobileHeader } from "@/components/mobile-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { postsService, Post } from "@/lib/services/posts"
import { Skeleton } from "@/components/ui/skeleton"

// TODO: Fetch trending topics from backend
const TRENDING_TOPICS: any[] = []

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("Latest")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        let fetchedPosts: Post[] = [];
        if (activeTab === 'all') {
            fetchedPosts = await postsService.getFeedPosts();
        } else if (activeTab === 'following') {
            fetchedPosts = await postsService.getFollowingPosts(user.$id);
        } else if (activeTab === 'pods') {
            fetchedPosts = await postsService.getPodPosts(user.$id);
        }
        setPosts(fetchedPosts)
        setError(null)
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.")
        toast({
          title: "Error",
          description: "Could not fetch feed posts.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [activeTab, user, toast])

  const handleLike = (postId: string) => {
    // TODO: Implement backend call for liking a post
    console.log(`Liking post ${postId}`)
  }

  const handleBookmark = (postId: string) => {
    // TODO: Implement backend call for bookmarking a post
    console.log(`Bookmarking post ${postId}`)
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

  const sortedPosts = posts
    .filter((post) => {
        const matchesSearch =
        searchQuery === "" ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesSearch
    })
    .sort((a, b) => {
        if (sortBy === 'Popular' || sortBy === 'Trending') { // TODO: Differentiate Trending
            return (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount);
        }
        // Default to Latest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const renderPostSkeletons = () => (
    [...Array(5)].map((_, index) => (
      <Card key={index} className="border-0 md:border shadow-sm">
        <CardHeader className="pb-3 px-4 md:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 md:px-6">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  )

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
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Sort By: {sortBy}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('Latest')}>Latest</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('Popular')}>Popular</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('Trending')}>Trending</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
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
            {isLoading ? (
              renderPostSkeletons()
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-destructive">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Could not load feed</h3>
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : sortedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                    <p>Try adjusting your search or filters, or be the first to post!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sortedPosts.map((post) => (
                <PostCard key={post.$id} post={post} />
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
