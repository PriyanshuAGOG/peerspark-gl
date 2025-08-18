"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share2, Bookmark, Users, MoreHorizontal, User, Flag } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Post } from "@/lib/services/posts"
import { UserProfile, useAuth } from "@/lib/auth"
import { usersService } from "@/lib/services/users"
import { interactionsService } from "@/lib/services/interactions"
import { podsService, Pod } from "@/lib/services/pods"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [author, setAuthor] = useState<UserProfile | null>(null)
  const [pod, setPod] = useState<Pod | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeId, setLikeId] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAuthor = async () => {
      if (post.authorId) {
        const authorProfile = await usersService.getProfile(post.authorId)
        setAuthor(authorProfile)
      }
    }

    const checkInteractions = async () => {
        if (!user) return;
        const like = await interactionsService.getLike(user.$id, post.$id);
        if (like) {
            setIsLiked(true);
            setLikeId(like.$id);
        }
        const bookmark = await interactionsService.getBookmark(user.$id, post.$id);
        if (bookmark) {
            setIsBookmarked(true);
            setBookmarkId(bookmark.$id);
        }
    }

    const fetchPod = async () => {
        if (post.podId) {
            const podData = await podsService.getPod(post.podId);
            setPod(podData);
        }
    }

    fetchAuthor()
    checkInteractions()
    fetchPod()
  }, [post.authorId, post.$id, user, post.podId])

  const handlePostClick = (username: string) => {
    router.push(`/app/profile/${username}`)
  }

  const handleInteraction = async (interaction: 'like' | 'bookmark' | 'share' | 'comment' | 'report') => {
    if (!user) {
        toast({ title: "Please login to interact", variant: "destructive" });
        return;
    }

    if (interaction === 'like') {
        if (isLiked && likeId) {
            await interactionsService.unlike(likeId, post.$id, 'post');
            setIsLiked(false);
            setLikeId(null);
        } else {
            const newLike = await interactionsService.like(user.$id, post.$id, 'post');
            setIsLiked(true);
            setLikeId(newLike.$id);
        }
    } else if (interaction === 'bookmark') {
        if (isBookmarked && bookmarkId) {
            await interactionsService.unbookmark(bookmarkId, post.$id, 'post');
            setIsBookmarked(false);
            setBookmarkId(null);
        } else {
            const newBookmark = await interactionsService.bookmark(user.$id, post.$id, 'post');
            setIsBookmarked(true);
            setBookmarkId(newBookmark.$id);
        }
    } else {
        toast({
            title: "Coming Soon!",
            description: `The '${interaction}' feature is under development.`,
        })
    }
  }

  if (!author) {
    // You can return a skeleton loader here as well
    return null
  }

  return (
    <Card key={post.$id} className="hover:shadow-md transition-shadow border-0 md:border shadow-sm">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => handlePostClick(author.username)}
            >
              <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.displayName} />
              <AvatarFallback>
                {author.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4
                  className="font-semibold text-sm cursor-pointer hover:underline"
                  onClick={() => handlePostClick(author.username)}
                >
                  {author.displayName}
                </h4>
                <span className="text-muted-foreground text-sm hidden md:inline">
                  @{author.username}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {pod && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => router.push(`/app/pods/${pod.$id}`)}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {pod.name}
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
              onClick={() => handleInteraction('bookmark')}
              className={`h-8 w-8 ${isBookmarked ? "text-yellow-500" : ""}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePostClick(author.username)}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleInteraction('share')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleInteraction('bookmark')}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleInteraction('report')}
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
            {post.tags.map((tag: string) => (
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
              onClick={() => handleInteraction('like')}
              className={`${isLiked ? "text-red-500" : ""} hover:text-red-500 h-8 px-2 md:px-3`}
            >
              <Heart className={`w-4 h-4 mr-1 md:mr-2 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs md:text-sm">{post.likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInteraction('comment')}
              className="hover:text-blue-500 h-8 px-2 md:px-3"
            >
              <MessageCircle className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">{post.commentsCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInteraction('share')}
              className="hover:text-green-500 h-8 px-2 md:px-3"
            >
              <Share2 className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm hidden md:inline">{post.sharesCount}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
