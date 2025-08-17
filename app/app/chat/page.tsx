"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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

interface ChatRoom {
  id: string
  name: string
  type: "pod" | "direct"
  avatar?: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount?: number
  isOnline?: boolean
  participants?: string[]
  podId?: string
}

interface Message {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  timestamp: Date
  type: "text" | "image" | "file" | "system"
  fileUrl?: string
  fileName?: string
  isEdited?: boolean
  mentions?: string[]
}

const mockChatRooms: ChatRoom[] = [
  {
    id: "pod_1",
    name: "Mathematics Study Group",
    type: "pod",
    avatar: "/placeholder.svg?height=40&width=40&text=Math",
    lastMessage: "Let's solve this calculus problem together",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 3,
  },
  {
    id: "pod_2",
    name: "Computer Science Hub",
    type: "pod",
    avatar: "/placeholder.svg?height=40&width=40&text=CS",
    lastMessage: "Check out this algorithm explanation",
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
    unreadCount: 1,
  },
  {
    id: "direct_1",
    name: "Sarah Johnson",
    type: "direct",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    lastMessage: "Thanks for the study notes!",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
    isOnline: true,
  },
  {
    id: "direct_2",
    name: "Alex Chen",
    type: "direct",
    avatar: "/placeholder.svg?height=40&width=40&text=AC",
    lastMessage: "See you in the library tomorrow",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isOnline: false,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey everyone! Ready for today's study session?",
    authorId: "user1",
    authorName: "Sarah Johnson",
    authorAvatar: "/placeholder.svg?height=32&width=32&text=SJ",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: "text",
  },
  {
    id: "2",
    content: "I've prepared some practice problems for us to work through.",
    authorId: "user2",
    authorName: "Alex Chen",
    authorAvatar: "/placeholder.svg?height=32&width=32&text=AC",
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
    type: "text",
  },
  {
    id: "3",
    content:
      "Perfect! Let's start with derivatives and then move to integrals. @ai can you help explain the chain rule?",
    authorId: "current",
    authorName: "You",
    timestamp: new Date(Date.now() - 50 * 60 * 1000),
    type: "text",
    mentions: ["ai"],
  },
  {
    id: "4",
    content:
      "The chain rule is used to find the derivative of composite functions. If you have f(g(x)), the derivative is f'(g(x)) × g'(x). Would you like me to show you some examples?",
    authorId: "ai",
    authorName: "AI Assistant",
    authorAvatar: "/placeholder.svg?height=32&width=32&text=AI",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: "text",
  },
]

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileChatList, setShowMobileChatList] = useState(true)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatType, setNewChatType] = useState<"pod" | "direct">("direct")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedRoom || isLoading) return

    // Check for @ai mentions
    const hasAIMention = inputValue.includes("@ai")
    const mentions = hasAIMention ? ["ai"] : []

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      authorId: "current",
      authorName: "You",
      timestamp: new Date(),
      type: "text",
      mentions,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // If AI is mentioned, generate AI response
    if (hasAIMention) {
      setIsLoading(true)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(inputValue),
          authorId: "ai",
          authorName: "AI Assistant",
          authorAvatar: "/placeholder.svg?height=32&width=32&text=AI",
          timestamp: new Date(),
          type: "text",
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1500)
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

  const filteredRooms = mockChatRooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (date: Date) => {
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
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRoom?.id === room.id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <CardContent className="p-2 lg:p-3">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                            <AvatarImage src={room.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs lg:text-sm">
                              {room.type === "pod" ? <Hash className="h-3 w-3 lg:h-4 lg:w-4" /> : room.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {room.type === "direct" && room.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-xs lg:text-sm truncate">{room.name}</p>
                            {room.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">{formatTime(room.lastMessageTime)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                            {room.unreadCount && room.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-4 min-w-4 text-xs px-1">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pods" className="flex-1 mt-2">
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {filteredRooms
                  .filter((room) => room.type === "pod")
                  .map((room) => (
                    <Card
                      key={room.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRoom?.id === room.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <CardContent className="p-2 lg:p-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                            <AvatarImage src={room.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              <Hash className="h-3 w-3 lg:h-4 lg:w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-xs lg:text-sm truncate">{room.name}</p>
                              {room.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(room.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="direct" className="flex-1 mt-2">
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {filteredRooms
                  .filter((room) => room.type === "direct")
                  .map((room) => (
                    <Card
                      key={room.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRoom?.id === room.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <CardContent className="p-2 lg:p-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                              <AvatarImage src={room.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs lg:text-sm">{room.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            {room.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-xs lg:text-sm truncate">{room.name}</p>
                              {room.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(room.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Chat List */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-background transform transition-transform ${showMobileChatList ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Messages</h1>
              <div className="flex items-center space-x-2">
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
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
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
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => handleRoomSelect(room)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={room.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {room.type === "pod" ? <Hash className="h-4 w-4" /> : room.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {room.type === "direct" && room.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{room.name}</p>
                            {room.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">{formatTime(room.lastMessageTime)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                            {room.unreadCount && room.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {selectedRoom ? (
          <>
            {/* Mobile Header */}
            <div
              className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-4"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowMobileChatList(true)} className="h-8 w-8 p-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedRoom.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedRoom.type === "pod" ? <Hash className="h-3 w-3" /> : selectedRoom.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRoom.type === "direct" && selectedRoom.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm truncate">{selectedRoom.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedRoom.type === "pod" ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Study Group
                        </span>
                      ) : selectedRoom.isOnline ? (
                        "Online"
                      ) : (
                        "Last seen recently"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={startVideoCall} className="h-8 w-8 p-0">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Chat Header */}
            <div className="hidden lg:block border-b bg-card p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedRoom.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedRoom.type === "pod" ? <Hash className="h-4 w-4" /> : selectedRoom.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRoom.type === "direct" && selectedRoom.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedRoom.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.type === "pod" ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Study Group
                        </span>
                      ) : selectedRoom.isOnline ? (
                        "Online"
                      ) : (
                        "Last seen recently"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={startVideoCall}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Chat Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full p-3 lg:p-4">
                <div className="space-y-3 lg:space-y-4 max-w-4xl mx-auto pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 lg:gap-3 ${message.authorId === "current" ? "justify-end" : "justify-start"}`}
                    >
                      {message.authorId !== "current" && (
                        <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 flex-shrink-0">
                          <AvatarImage src={message.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {message.authorId === "ai" ? "AI" : message.authorName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] ${
                          message.authorId === "current"
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                            : message.authorId === "ai"
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-2xl rounded-bl-md border border-blue-200 dark:border-blue-800"
                              : "bg-muted rounded-2xl rounded-bl-md"
                        } p-2 lg:p-3`}
                      >
                        {message.authorId !== "current" && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.authorName}
                            {message.authorId === "ai" && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                AI
                              </Badge>
                            )}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content.split(/(@\w+)/g).map((part, index) => {
                            if (part.startsWith("@")) {
                              return (
                                <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
                                  {part}
                                </span>
                              )
                            }
                            return part
                          })}
                        </p>
                        <p className="text-xs opacity-70 mt-1 lg:mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {message.isEdited && <span className="ml-1">(edited)</span>}
                        </p>
                      </div>

                      {message.authorId === "current" && (
                        <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="text-xs">You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 lg:gap-3 justify-start">
                      <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-2xl rounded-bl-md p-2 lg:p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
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
