"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, Search, Upload, Filter, Grid3X3, List, FileText, ImageIcon, Video, Code, BookOpen, Download, Share2, Star, Eye, Clock, Heart, ExternalLink, Play } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { resourcesService, Resource } from "@/lib/services/resources"
import { storageService } from "@/lib/services/storage"
import { Skeleton } from "@/components/ui/skeleton"

const RESOURCE_TYPES = [
  { id: "all", label: "All", icon: FolderOpen },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "code", label: "Code", icon: Code },
  { id: "flashcards", label: "Flashcards", icon: BookOpen },
]

const FOLDERS = [
  { name: "My Notes", count: 23, icon: FileText },
  { name: "Shared Resources", count: 45, icon: Share2 },
  { name: "Bookmarked", count: 12, icon: Star },
  { name: "Recent", count: 8, icon: Clock },
]

export default function VaultPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      const fetchedResources = await resourcesService.getResources()
      setResources(fetchedResources)
      setIsLoading(false)
    }
    fetchResources()
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    toast({
      title: "Uploading...",
      description: `Uploading ${file.name}.`,
    })

    try {
      const fileId = await storageService.uploadFile(file)
      const fileUrl = storageService.getFileUrl(fileId).toString()

      const resourceData = {
        fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl,
        title: file.name,
        authorId: user.$id,
        tags: [],
        visibility: 'private' as const,
        category: 'general',
      }

      const newResource = await resourcesService.createResource(resourceData)
      setResources(prev => [newResource, ...prev])

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload the file.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      toast({
        title: "Downloading",
        description: `Starting download of ${resource.title}`,
      })
      // Simulate download
      setTimeout(() => {
        setResources(prev => 
          prev.map(r => 
            r.id === resourceId 
              ? { ...r, downloads: r.downloads + 1 }
              : r
          )
        )
        toast({
          title: "Download Complete",
          description: `${resource.title} has been downloaded`,
        })
      }, 1000)
    }
  }

  const handleLike = (resourceId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { 
              ...resource, 
              isLiked: !resource.isLiked,
              likes: resource.isLiked ? resource.likes - 1 : resource.likes + 1
            }
          : resource
      )
    )
    
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      toast({
        title: resource.isLiked ? "Like Removed" : "Resource Liked",
        description: resource.isLiked ? "Removed from liked resources" : `Added ${resource.title} to your liked resources`,
      })
    }
  }

  const handleBookmark = (resourceId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, isBookmarked: !resource.isBookmarked }
          : resource
      )
    )
    
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      toast({
        title: resource.isBookmarked ? "Bookmark Removed" : "Resource Bookmarked",
        description: resource.isBookmarked ? "Removed from bookmarks" : `Saved ${resource.title} to your bookmarks`,
      })
    }
  }

  const handleView = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      setResources(prev => 
        prev.map(r => 
          r.id === resourceId 
            ? { ...r, views: r.views + 1 }
            : r
        )
      )
      toast({
        title: "Opening Resource",
        description: `Opening ${resource.title}`,
      })
      // Simulate opening resource
      window.open('#', '_blank')
    }
  }

  const handleShare = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      navigator.clipboard.writeText(`https://peerspark.com/resource/${resourceId}`)
      toast({
        title: "Link Copied",
        description: `Share link for ${resource.title} copied to clipboard`,
      })
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = selectedType === "all" || resource.category === selectedType

    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    const typeMap = {
      notes: FileText,
      images: ImageIcon,
      videos: Video,
      code: Code,
      flashcards: BookOpen,
    }
    const Icon = typeMap[type as keyof typeof typeMap] || FileText
    return <Icon className="w-4 h-4" />
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "pod":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "private":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const renderResourceGrid = (resourcesToRender: Resource[]) => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {resourcesToRender.map((resource) => (
        <Card key={resource.$id} className="hover:shadow-md transition-shadow group">
          {/* ... content remains the same, just use resource properties ... */}
        </Card>
      ))}
    </div>
  )

  const renderResourceList = (resourcesToRender: Resource[]) => (
    <div className="space-y-2">
      {resourcesToRender.map((resource) => (
        <Card key={resource.$id} className="hover:shadow-md transition-shadow">
          {/* ... content remains the same, just use resource properties ... */}
        </Card>
      ))}
    </div>
  )

  const renderSkeletons = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Resource Vault</h1>
            <p className="text-sm text-muted-foreground">Your learning library</p>
          </div>
          <Button size="sm" onClick={handleUploadClick} className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Type Filter */}
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedType === type.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Resource Vault</h1>
              <p className="text-muted-foreground">Your centralized learning library</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resource
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 md:pb-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Quick Folders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FOLDERS.map((folder) => (
                  <Button key={folder.name} variant="ghost" className="w-full justify-start">
                    <folder.icon className="w-4 h-4 mr-3" />
                    <span className="flex-1 text-left">{folder.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Resource Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {RESOURCE_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "ghost"}
                    className={`w-full justify-start ${selectedType === type.id ? "bg-primary" : ""}`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <type.icon className="w-4 h-4 mr-3" />
                    {type.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Storage Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Used</span>
                  <span>2.4 GB / 5 GB</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "48%" }}></div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Upgrade Storage
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Desktop Search and Controls */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources, tags, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-primary" : ""}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-primary" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile View Mode Toggle */}
            <div className="md:hidden flex items-center justify-between">
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-primary" : ""}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-primary" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resources Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my-uploads">Uploads</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarks</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {isLoading ? renderSkeletons() : viewMode === "grid" ? renderResourceGrid(filteredResources) : renderResourceList(filteredResources)}
              </TabsContent>

              <TabsContent value="my-uploads" className="space-y-4">
                {isLoading ? renderSkeletons() : renderResourceGrid(filteredResources.filter(r => r.authorId === user?.$id))}
              </TabsContent>

              <TabsContent value="bookmarked" className="space-y-4">
                {/* Add bookmark logic */}
                <p>Bookmark feature coming soon.</p>
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {/* Add recent logic */}
                <p>Recently viewed feature coming soon.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
