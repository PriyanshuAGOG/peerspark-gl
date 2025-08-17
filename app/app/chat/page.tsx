"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Users,
  Hash,
  Plus,
  Smile,
  Paperclip,
  ImageIcon,
  Calendar,
  Settings,
  MessageSquare,
  ArrowLeft,
  AtSign,
  UserPlus,
  HashIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { chatService, ChatRoom, ChatMessage } from "@/lib/services/chat"
import { authService, UserProfile } from "@/lib/auth"

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [authors, setAuthors] = useState<Record<string, UserProfile>>({})
  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [showMobileChatList, setShowMobileChatList] = useState(true)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatType, setNewChatType] = useState<"pod" | "direct">("direct")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, profile } = useAuth()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchRooms = async () => {
      setIsLoadingRooms(true)
      const userRooms = await chatService.getUserRooms(user.$id)
      setRooms(userRooms)
      setIsLoadingRooms(false)
    }
    fetchRooms()
  }, [user])

  useEffect(() => {
    if (!selectedRoom) return

    const fetchMessages = async () => {
      setIsLoading(true)
      const roomMessages = await chatService.getRoomMessages(selectedRoom.roomId)
      setMessages(roomMessages)
      setIsLoading(false)
    }
    fetchMessages()

    const unsubscribe = chatService.subscribeToRoom(selectedRoom.roomId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage])
    })

    return () => unsubscribe()
  }, [selectedRoom])

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorIds = [...new Set(messages.map(m => m.senderId))]
      const newAuthors: Record<string, UserProfile> = {}
      for (const id of authorIds) {
        if (!authors[id]) {
          const authorProfile = await authService.getUserProfile(id)
          if (authorProfile) {
            newAuthors[id] = authorProfile
          }
        }
      }
      if (Object.keys(newAuthors).length > 0) {
        setAuthors(prev => ({...prev, ...newAuthors}))
      }
    }
    if (messages.length > 0) {
        fetchAuthors()
    }
  }, [messages, authors])


  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedRoom || !user || isLoading) return

    setIsLoading(true)
    try {
      await chatService.sendMessage(selectedRoom.roomId, user.$id, inputValue)
      setInputValue("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (input: string): string => {
    const responses = [
      "I'd be happy to help you with that! Let me break this down step by step...",
      "Great question! Here's what you need to know about this topic...",
      "That's an interesting problem. Let me walk you through the solution...",
      "I can definitely assist with that. Here's my explanation...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast({
      title: "File upload",
      description: `Uploading ${file.name}...`,
    })
  }

  const startVideoCall = async () => {
    if (!selectedRoom) return

    try {
      toast({
        title: "Starting video call",
        description: `Starting call in ${selectedRoom.name}...`,
      })
      // Simulate video call start
      setTimeout(() => {
        toast({
          title: "Call started",
          description: "Video call is now active",
        })
      }, 1000)
    } catch (error) {
      console.error("Failed to start video call:", error)
      toast({
        title: "Failed to start call",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room)
    setShowMobileChatList(false)
  }

  const handleCreateNewChat = () => {
    setShowNewChatDialog(false)
    toast({
      title: "Creating new chat",
      description: `Creating new ${newChatType} chat...`,
    })
  }

  const filteredRooms = rooms.filter((room) => room.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const insertAIMention = () => {
    const currentValue = inputValue
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const newValue = currentValue.slice(0, cursorPosition) + "@ai " + currentValue.slice(cursorPosition)
    setInputValue(newValue)

    // Focus and set cursor position after @ai
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(cursorPosition + 4, cursorPosition + 4)
      }
    }, 0)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 xl:w-96 border-r bg-card flex-col">
        <div className="p-3 lg:p-4 border-b">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h1 className="text-lg lg:text-xl font-semibold">Messages</h1>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                  <DialogDescription>Create a new direct message or pod chat</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs value={newChatType} onValueChange={(value) => setNewChatType(value as "pod" | "direct")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="direct">Direct Message</TabsTrigger>
                      <TabsTrigger value="pod">Pod Chat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="direct" className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search users</label>
                        <Input placeholder="Type username or email..." />
                      </div>
                      <Button onClick={handleCreateNewChat} className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Start Direct Chat
                      </Button>
                    </TabsContent>
                    <TabsContent value="pod" className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search pods</label>
                        <Input placeholder="Type pod name..." />
                      </div>
                      <Button onClick={handleCreateNewChat} className="w-full">
                        <HashIcon className="w-4 h-4 mr-2" />
                        Join Pod Chat
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-3 lg:mx-4 mt-2">
            <TabsTrigger value="all" className="text-xs lg:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="pods" className="text-xs lg:text-sm">
              Pods
            </TabsTrigger>
            <TabsTrigger value="direct" className="text-xs lg:text-sm">
              Direct
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 mt-2">
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {isLoadingRooms ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : filteredRooms.map((room) => (
                  <Card
                    key={room.$id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRoom?.$id === room.$id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <CardContent className="p-2 lg:p-3">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                            <AvatarImage src={room.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs lg:text-sm">
                              {room.type === "pod" ? <Hash className="h-3 w-3 lg:h-4 lg:w-4" /> : room.name?.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-xs lg:text-sm truncate">{room.name}</p>
                            {room.lastActivity && (
                              <span className="text-xs text-muted-foreground">{formatTime(room.lastActivity)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">...</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ... (repeat for pods and direct tabs) ... */}
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="hidden lg:block border-b bg-card p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">{selectedRoom.name}</h2>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full p-3 lg:p-4">
                <div className="space-y-3 lg:space-y-4 max-w-4xl mx-auto pb-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : messages.map((message) => {
                    const author = authors[message.senderId];
                    return (
                      <div
                        key={message.$id}
                        className={`flex gap-2 lg:gap-3 ${message.senderId === user?.$id ? "justify-end" : "justify-start"}`}
                      >
                        {message.senderId !== user?.$id && (
                          <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 flex-shrink-0">
                            <AvatarImage src={author?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {author?.displayName.slice(0, 2) || '??'}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] ${
                            message.senderId === user?.$id
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                              : "bg-muted rounded-2xl rounded-bl-md"
                          } p-2 lg:p-3`}
                        >
                          {message.senderId !== user?.$id && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {author?.displayName || 'Unknown User'}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1 lg:mt-2">
                            {formatTime(message.$createdAt)}
                          </p>
                        </div>

                        {message.senderId === user?.$id && (
                          <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 flex-shrink-0">
                            <AvatarFallback className="text-xs">You</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div
              className="border-t bg-card p-3 lg:p-4 shrink-0"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedRoom.name}... (Type @ai to ask AI)`}
                      className="min-h-[44px] max-h-32 resize-none pr-28 lg:pr-32 text-sm lg:text-base"
                      disabled={isLoading}
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 lg:h-8 lg:w-8 p-0"
                        onClick={insertAIMention}
                        disabled={isLoading}
                        title="Mention AI Assistant"
                      >
                        <AtSign className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 lg:h-8 lg:w-8 p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Paperclip className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 lg:h-8 lg:w-8 p-0" disabled={isLoading}>
                        <ImageIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 lg:h-8 lg:w-8 p-0" disabled={isLoading}>
                        <Smile className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 px-3 lg:px-4 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <p>Press Enter to send, Shift+Enter for new line. Type @ai to ask AI assistant</p>
                  <p className="hidden lg:block">
                    {selectedRoom.type === "pod" ? "Pod Chat" : "Direct Message"} • End-to-end encrypted
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground text-sm lg:text-base">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
