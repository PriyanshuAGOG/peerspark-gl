"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { MapPin, Calendar, Link as LinkIcon, MessageSquare, UserPlus, ArrowLeft, Edit, Settings } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { usersService } from "@/lib/services/users"
import { postsService, Post } from "@/lib/services/posts"
import { interactionsService } from "@/lib/services/interactions"
import { UserProfile } from "@/lib/auth"
import { ProfileSkeleton } from "@/components/profile-skeleton"
import { PostCard } from "@/components/post-card"

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser, profile: currentUserProfile } = useAuth()

  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followId, setFollowId] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return

    const fetchProfileData = async () => {
      setIsLoading(true)
      const profile = await usersService.getProfileByUsername(username)

      if (!profile) {
        toast({ title: "User not found", variant: "destructive" })
        router.push("/app/feed")
        return
      }

      setViewedProfile(profile)

      const userPosts = await postsService.getUserPosts(profile.userId)
      setPosts(userPosts)

      if (currentUser && currentUser.$id !== profile.userId) {
        const followStatus = await interactionsService.isFollowing(currentUser.$id, profile.userId)
        setIsFollowing(followStatus.isFollowing)
        setFollowId(followStatus.followId)
      }

      setIsLoading(false)
    }

    fetchProfileData()
  }, [username, currentUser, router, toast])

  const handleFollowToggle = async () => {
    if (!currentUser || !viewedProfile) {
      toast({ title: "Please login to follow users", variant: "destructive" })
      return
    }

    if (isFollowing && followId) {
      // Unfollow
      await interactionsService.unfollow(followId, currentUser.$id, viewedProfile.userId)
      setIsFollowing(false)
      setFollowId(null)
      setViewedProfile(p => p ? { ...p, followersCount: p.followersCount - 1 } : null)
      toast({ title: "Unfollowed " + viewedProfile.displayName })
    } else {
      // Follow
      const newFollow = await interactionsService.follow(currentUser.$id, viewedProfile.userId)
      setIsFollowing(true)
      setFollowId(newFollow.$id)
      setViewedProfile(p => p ? { ...p, followersCount: p.followersCount + 1 } : null)
      toast({ title: "Followed " + viewedProfile.displayName })
    }
  }

  const handleMessage = () => {
    if (!viewedProfile) return
    // This assumes a chat can be started with a userId.
    // The actual implementation might need to create a chat room first.
    router.push(`/app/chat?userId=${viewedProfile.userId}`)
  }

  if (isLoading || !viewedProfile) {
    return <ProfileSkeleton />
  }

  const isOwnProfile = currentUser && currentUser.$id === viewedProfile.userId

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">{viewedProfile.displayName}</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Profile Header */}
        <Card className="mb-4 md:mb-8">
          <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col space-y-4">
              <div className="hidden md:flex items-start space-x-6">
                <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
                  <AvatarImage src={viewedProfile.avatar || "/placeholder.svg"} alt={viewedProfile.displayName} />
                  <AvatarFallback className="text-2xl">
                    {viewedProfile.displayName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{viewedProfile.displayName}</h1>
                    <p className="text-muted-foreground text-lg">@{viewedProfile.username}</p>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{viewedProfile.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{viewedProfile.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-primary cursor-pointer hover:underline">{viewedProfile.website || "Not specified"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(viewedProfile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="cursor-pointer hover:underline">
                      <span className="font-semibold">{viewedProfile.followingCount.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">Following</span>
                    </div>
                    <div className="cursor-pointer hover:underline">
                      <span className="font-semibold">{viewedProfile.followersCount.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">Followers</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isOwnProfile ? (
                    <Button onClick={() => router.push('/app/profile')}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleMessage} variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        onClick={handleFollowToggle}
                        className={isFollowing ? "bg-muted hover:bg-muted/80 text-muted-foreground" : ""}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-4">
            {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.$id} post={post} />)
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
