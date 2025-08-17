import { Client, Account, Databases, Storage, Teams, Avatars, Functions, Messaging } from "appwrite"

// Initialize Appwrite Client with your credentials
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Your Appwrite Endpoint
  .setProject("68921a0d00146e65d29b") // Your Project ID

// Initialize Appwrite services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const teams = new Teams(client)
export const avatars = new Avatars(client)
export const functions = new Functions(client)
export const messaging = new Messaging(client)

// Database and Collection IDs - You'll need to create these in Appwrite
export const DATABASE_ID = "peerspark-main-db"
export const COLLECTIONS = {
  PROFILES: "profiles",
  POSTS: "posts",
  MESSAGES: "messages",
  RESOURCES: "resources",
  NOTIFICATIONS: "notifications",
  PODS: "pods",
  CALENDAR_EVENTS: "calendar_events",
  CHAT_ROOMS: "chat_rooms",
}

// Storage Bucket IDs - You'll need to create these in Appwrite
export const BUCKETS = {
  AVATARS: "avatars",
  RESOURCES: "resources",
  ATTACHMENTS: "attachments",
  POST_IMAGES: "post_images",
}

// Authentication Functions
export const authService = {
  // Register new user
  async register(email: string, password: string, name: string) {
    try {
      const user = await account.create("unique()", email, password, name)

      // Create user profile in database
      await databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
        userId: user.$id,
        name: name,
        email: email,
        bio: "",
        interests: [],
        avatar: avatars.getInitials(name).toString(),
        joinedAt: new Date().toISOString(),
        isOnline: true,
        studyStreak: 0,
        totalPoints: 0,
        level: 1,
        badges: [],
      })

      return user
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailSession(email, password)

      // Update user online status
      const user = await account.get()
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
        isOnline: true,
        lastSeen: new Date().toISOString(),
      })

      return session
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // OAuth login (Google, GitHub, etc.)
  async loginWithOAuth(provider: string) {
    try {
      return await account.createOAuth2Session(
        provider as any,
        `${window.location.origin}/app/feed`, // Success URL
        `${window.location.origin}/login`, // Failure URL
      )
    } catch (error) {
      console.error("OAuth login error:", error)
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get()
    } catch (error) {
      return null
    }
  },

  // Logout
  async logout() {
    try {
      const user = await account.get()

      // Update user offline status
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      })

      return await account.deleteSession("current")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Change password
  async changePassword(newPassword: string, oldPassword: string) {
    try {
      return await account.updatePassword(newPassword, oldPassword)
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  },
}

// Profile Functions
export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId)
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(userId: string, data: any) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string) {
    try {
      // Delete old avatar if exists
      try {
        const profile = await this.getProfile(userId)
        if (profile.avatarFileId) {
          await storage.deleteFile(BUCKETS.AVATARS, profile.avatarFileId)
        }
      } catch (e) {
        // Ignore if no old avatar
      }

      // Upload new avatar
      const uploaded = await storage.createFile(BUCKETS.AVATARS, "unique()", file)
      const avatarUrl = storage.getFileView(BUCKETS.AVATARS, uploaded.$id)

      // Update profile with new avatar
      await this.updateProfile(userId, {
        avatar: avatarUrl.toString(),
        avatarFileId: uploaded.$id,
      })

      return avatarUrl.toString()
    } catch (error) {
      console.error("Upload avatar error:", error)
      throw error
    }
  },

  // Get all profiles (for search, leaderboard, etc.)
  async getAllProfiles(limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [], limit, offset)
    } catch (error) {
      console.error("Get all profiles error:", error)
      throw error
    }
  },
}

// Pod/Team Functions
export const podService = {
  // Create new pod
  async createPod(name: string, description: string, userId: string, metadata: any = {}) {
    try {
      // Create team in Appwrite Teams
      const team = await teams.create("unique()", name, [userId])

      // Store pod metadata in database
      const pod = await databases.createDocument(DATABASE_ID, COLLECTIONS.PODS, team.$id, {
        teamId: team.$id,
        name: name,
        description: description,
        creatorId: userId,
        members: [userId],
        subject: metadata.subject || "",
        difficulty: metadata.difficulty || "Beginner",
        tags: metadata.tags || [],
        isActive: true,
        isPublic: metadata.isPublic !== false,
        maxMembers: metadata.maxMembers || 50,
        createdAt: new Date().toISOString(),
        memberCount: 1,
        totalSessions: 0,
        totalResources: 0,
        avatar: metadata.avatar || "",
        rules: metadata.rules || [],
        schedule: metadata.schedule || {},
      })

      // Create default chat room for the pod
      await databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, `${team.$id}_general`, {
        podId: team.$id,
        name: "General",
        type: "pod",
        createdBy: userId,
        createdAt: new Date().toISOString(),
        isActive: true,
      })

      return { team, pod }
    } catch (error) {
      console.error("Create pod error:", error)
      throw error
    }
  },

  // Join pod
  async joinPod(podId: string, userId: string) {
    try {
      // Add user to team
      await teams.createMembership(podId, [], `${window.location.origin}/pod-invite`, userId)

      // Update pod member count and list
      const pod = await databases.getDocument(DATABASE_ID, COLLECTIONS.PODS, podId)
      const updatedMembers = [...new Set([...pod.members, userId])] // Avoid duplicates

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PODS, podId, {
        memberCount: updatedMembers.length,
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      })

      // Create notification for pod creator
      await notificationService.createNotification(
        pod.creatorId,
        "New Member Joined",
        `Someone joined your pod "${pod.name}"`,
        "pod_join",
        { podId, userId },
      )

      return true
    } catch (error) {
      console.error("Join pod error:", error)
      throw error
    }
  },

  // Leave pod
  async leavePod(podId: string, userId: string) {
    try {
      // Get user's membership and remove from team
      const memberships = await teams.listMemberships(podId)
      const membership = memberships.memberships.find((m) => m.userId === userId)

      if (membership) {
        await teams.deleteMembership(podId, membership.$id)
      }

      // Update pod member count and list
      const pod = await databases.getDocument(DATABASE_ID, COLLECTIONS.PODS, podId)
      const updatedMembers = pod.members.filter((id: string) => id !== userId)

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PODS, podId, {
        memberCount: Math.max(0, updatedMembers.length),
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error("Leave pod error:", error)
      throw error
    }
  },

  // Get user's pods
  async getUserPods(userId: string) {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.PODS, [`members CONTAINS "${userId}"`])
    } catch (error) {
      console.error("Get user pods error:", error)
      return { documents: [] }
    }
  },

  // Get all public pods
  async getAllPods(limit = 50, offset = 0, filters: any = {}) {
    try {
      const queries = ["isPublic = true", "isActive = true"]

      if (filters.subject) queries.push(`subject = "${filters.subject}"`)
      if (filters.difficulty) queries.push(`difficulty = "${filters.difficulty}"`)
      if (filters.search) queries.push(`name CONTAINS "${filters.search}"`)

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.PODS, queries, limit, offset, ["createdAt"])
    } catch (error) {
      console.error("Get all pods error:", error)
      return { documents: [] }
    }
  },

  // Get pod details with error handling
  async getPodDetails(podId: string) {
    try {
      // First try to get from pods collection
      const pod = await databases.getDocument(DATABASE_ID, COLLECTIONS.PODS, podId)
      return pod
    } catch (error) {
      console.error("Get pod details error:", error)

      // If pod doesn't exist in database, create a mock pod for demo purposes
      if (error.code === 404) {
        return {
          $id: podId,
          name: "Demo Pod",
          description: "This is a demo pod for testing purposes",
          members: ["demo-user"],
          creatorId: "demo-user",
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      }

      throw error
    }
  },
}

// Chat/Messaging Functions
export const chatService = {
  // Send message to pod or direct chat
  async sendMessage(roomId: string, userId: string, content: string, type = "text", metadata: any = {}) {
    try {
      const message = await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, "unique()", {
        roomId: roomId,
        authorId: userId,
        content: content,
        type: type, // text, image, file, audio, video
        timestamp: new Date().toISOString(),
        isEdited: false,
        editedAt: null,
        replyTo: metadata.replyTo || null,
        fileUrl: metadata.fileUrl || null,
        fileName: metadata.fileName || null,
        fileSize: metadata.fileSize || null,
        reactions: {},
        mentions: metadata.mentions || [],
      })

      return message
    } catch (error) {
      console.error("Send message error:", error)
      throw error
    }
  },

  // Get messages for a room/chat
  async getMessages(roomId: string, limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [`roomId = "${roomId}"`], limit, offset, [
        "timestamp",
      ])
    } catch (error) {
      console.error("Get messages error:", error)
      return { documents: [] }
    }
  },

  // Subscribe to real-time messages using client subscription
  subscribeToMessages(roomId: string, callback: (message: any) => void) {
    // For now, we'll use polling instead of real-time subscriptions
    // In production, you'd set up Appwrite realtime subscriptions
    const pollMessages = async () => {
      try {
        const messages = await this.getMessages(roomId, 1)
        if (messages.documents.length > 0) {
          callback(messages.documents[0])
        }
      } catch (error) {
        console.error("Poll messages error:", error)
      }
    }

    const interval = setInterval(pollMessages, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  },

  // Upload file attachment
  async uploadAttachment(file: File, userId: string) {
    try {
      const uploaded = await storage.createFile(BUCKETS.ATTACHMENTS, "unique()", file)
      const fileUrl = storage.getFileView(BUCKETS.ATTACHMENTS, uploaded.$id)

      return {
        fileId: uploaded.$id,
        fileUrl: fileUrl.toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }
    } catch (error) {
      console.error("Upload attachment error:", error)
      throw error
    }
  },

  // Create or get direct message room
  async getOrCreateDirectRoom(userId1: string, userId2: string) {
    try {
      // Create consistent room ID
      const roomId = [userId1, userId2].sort().join("_")

      try {
        // Try to get existing room
        return await databases.getDocument(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, roomId)
      } catch (e) {
        // Create new room if doesn't exist
        return await databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, roomId, {
          type: "direct",
          participants: [userId1, userId2],
          createdAt: new Date().toISOString(),
          isActive: true,
          lastMessage: null,
          lastMessageTime: null,
        })
      }
    } catch (error) {
      console.error("Get or create direct room error:", error)
      throw error
    }
  },

  // Get user's chat rooms
  async getUserChatRooms(userId: string) {
    try {
      // Get pod rooms
      const userPods = await podService.getUserPods(userId)
      const podRooms = await Promise.all(
        userPods.documents.map(async (pod: any) => {
          try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, `${pod.teamId}_general`)
          } catch (e) {
            return null
          }
        }),
      )

      // Get direct message rooms
      const directRooms = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, [
        `participants CONTAINS "${userId}"`,
        `type = "direct"`,
      ])

      return {
        podRooms: podRooms.filter((room) => room !== null),
        directRooms: directRooms.documents,
      }
    } catch (error) {
      console.error("Get user chat rooms error:", error)
      return { podRooms: [], directRooms: [] }
    }
  },
}

// Resource/File Functions
export const resourceService = {
  // Upload resource
  async uploadResource(file: File, metadata: any) {
    try {
      const uploaded = await storage.createFile(BUCKETS.RESOURCES, "unique()", file)
      const fileUrl = storage.getFileView(BUCKETS.RESOURCES, uploaded.$id)

      const resource = await databases.createDocument(DATABASE_ID, COLLECTIONS.RESOURCES, "unique()", {
        fileId: uploaded.$id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: fileUrl.toString(),
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags || [],
        authorId: metadata.authorId,
        podId: metadata.podId || null,
        visibility: metadata.visibility || "public", // public, pod, private
        category: metadata.category || "other",
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        likes: 0,
        views: 0,
        isApproved: true, // Auto-approve for now
      })

      return resource
    } catch (error) {
      console.error("Upload resource error:", error)
      throw error
    }
  },

  // Get resources with filters
  async getResources(filters: any = {}, limit = 50, offset = 0) {
    try {
      const queries = ["isApproved = true"]

      if (filters.authorId) queries.push(`authorId = "${filters.authorId}"`)
      if (filters.podId) queries.push(`podId = "${filters.podId}"`)
      if (filters.visibility) queries.push(`visibility = "${filters.visibility}"`)
      if (filters.category) queries.push(`category = "${filters.category}"`)
      if (filters.search) queries.push(`title CONTAINS "${filters.search}"`)

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.RESOURCES, queries, limit, offset, ["uploadedAt"])
    } catch (error) {
      console.error("Get resources error:", error)
      return { documents: [] }
    }
  },

  // Download resource
  async downloadResource(resourceId: string) {
    try {
      const resource = await databases.getDocument(DATABASE_ID, COLLECTIONS.RESOURCES, resourceId)

      // Increment download count
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.RESOURCES, resourceId, {
        downloads: resource.downloads + 1,
      })

      return storage.getFileDownload(BUCKETS.RESOURCES, resource.fileId)
    } catch (error) {
      console.error("Download resource error:", error)
      throw error
    }
  },
}

// Feed/Posts Functions
export const feedService = {
  // Create post
  async createPost(authorId: string, content: string, type = "text", metadata: any = {}) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.POSTS, "unique()", {
        authorId: authorId,
        content: content,
        type: type, // text, image, resource, achievement, poll
        podId: metadata.podId || null,
        resourceId: metadata.resourceId || null,
        imageUrl: metadata.imageUrl || null,
        imageFileId: metadata.imageFileId || null,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isEdited: false,
        editedAt: null,
        visibility: metadata.visibility || "public", // public, pod, followers
        tags: metadata.tags || [],
        mentions: metadata.mentions || [],
      })
    } catch (error) {
      console.error("Create post error:", error)
      throw error
    }
  },

  // Get feed posts
  async getFeedPosts(userId?: string, limit = 20, offset = 0) {
    try {
      const queries = ['visibility = "public"']

      // If user is provided, also include their pod posts
      if (userId) {
        const userPods = await podService.getUserPods(userId)
        const podIds = userPods.documents.map((pod: any) => pod.teamId)

        if (podIds.length > 0) {
          // This is a simplified approach - in production you'd want more complex filtering
          queries.push(`visibility = "pod"`)
        }
      }

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.POSTS, queries, limit, offset, ["timestamp"])
    } catch (error) {
      console.error("Get feed posts error:", error)
      return { documents: [] }
    }
  },

  // Like/unlike post
  async toggleLike(postId: string, userId: string) {
    try {
      const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId)
      const currentLikes = post.likes || 0
      const likedBy = post.likedBy || []

      const isLiked = likedBy.includes(userId)
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1
      const newLikedBy = isLiked ? likedBy.filter((id: string) => id !== userId) : [...likedBy, userId]

      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.POSTS, postId, {
        likes: newLikes,
        likedBy: newLikedBy,
      })
    } catch (error) {
      console.error("Toggle like error:", error)
      throw error
    }
  },

  // Subscribe to real-time posts
  subscribeToFeed(callback: (post: any) => void) {
    // For now, we'll use polling instead of real-time subscriptions
    const pollPosts = async () => {
      try {
        const posts = await this.getFeedPosts(undefined, 1)
        if (posts.documents.length > 0) {
          callback(posts.documents[0])
        }
      } catch (error) {
        console.error("Poll posts error:", error)
      }
    }

    const interval = setInterval(pollPosts, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  },
}

// Calendar Functions
export const calendarService = {
  // Create calendar event
  async createEvent(
    userId: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    metadata: any = {},
  ) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.CALENDAR_EVENTS, "unique()", {
        userId: userId,
        title: title,
        description: description,
        startTime: startTime,
        endTime: endTime,
        type: metadata.type || "study", // study, meeting, deadline, exam
        podId: metadata.podId || null,
        isRecurring: metadata.isRecurring || false,
        recurringPattern: metadata.recurringPattern || null,
        attendees: metadata.attendees || [],
        location: metadata.location || "",
        meetingUrl: metadata.meetingUrl || "",
        reminders: metadata.reminders || [15], // minutes before
        createdAt: new Date().toISOString(),
        isCompleted: false,
      })
    } catch (error) {
      console.error("Create event error:", error)
      throw error
    }
  },

  // Get user events
  async getUserEvents(userId: string, startDate?: string, endDate?: string) {
    try {
      const queries = [`userId = "${userId}"`]

      if (startDate) queries.push(`startTime >= "${startDate}"`)
      if (endDate) queries.push(`endTime <= "${endDate}"`)

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.CALENDAR_EVENTS, queries, 100, 0, ["startTime"])
    } catch (error) {
      console.error("Get user events error:", error)
      return { documents: [] }
    }
  },

  // Update event
  async updateEvent(eventId: string, updates: any) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.CALENDAR_EVENTS, eventId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Update event error:", error)
      throw error
    }
  },

  // Delete event
  async deleteEvent(eventId: string) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CALENDAR_EVENTS, eventId)
    } catch (error) {
      console.error("Delete event error:", error)
      throw error
    }
  },
}

// Notification Functions
export const notificationService = {
  // Create notification
  async createNotification(userId: string, title: string, message: string, type = "info", metadata: any = {}) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, "unique()", {
        userId: userId,
        title: title,
        message: message,
        type: type, // info, success, warning, error, pod_join, message, resource, event
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: metadata.actionUrl || null,
        actionText: metadata.actionText || null,
        imageUrl: metadata.imageUrl || null,
        ...metadata,
      })
    } catch (error) {
      console.error("Create notification error:", error)
      throw error
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [`userId = "${userId}"`],
        limit,
        offset,
        ["timestamp"],
      )
    } catch (error) {
      console.error("Get notifications error:", error)
      return { documents: [] }
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, notificationId, {
        isRead: true,
        readAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Mark notification as read error:", error)
      throw error
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId, 100)

      await Promise.all(
        notifications.documents.filter((notif: any) => !notif.isRead).map((notif: any) => this.markAsRead(notif.$id)),
      )

      return true
    } catch (error) {
      console.error("Mark all as read error:", error)
      throw error
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    // For now, we'll use polling instead of real-time subscriptions
    const pollNotifications = async () => {
      try {
        const notifications = await this.getUserNotifications(userId, 1)
        if (notifications.documents.length > 0) {
          callback(notifications.documents[0])
        }
      } catch (error) {
        console.error("Poll notifications error:", error)
      }
    }

    const interval = setInterval(pollNotifications, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  },
}

// Jitsi Integration for Video Calls
export const jitsiService = {
  // Generate Jitsi meeting URL
  generateMeetingUrl(roomName: string, displayName: string, options: any = {}) {
    const domain = "meet.jit.si" // Free Jitsi server
    const config = {
      roomName: roomName.replace(/[^a-zA-Z0-9]/g, ""), // Clean room name
      width: options.width || "100%",
      height: options.height || "600px",
      parentNode: options.parentNode || document.body,
      configOverwrite: {
        startWithAudioMuted: options.startMuted || false,
        startWithVideoMuted: options.startVideoMuted || false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        ...options.config,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "profile",
          "chat",
          "recording",
          "livestreaming",
          "etherpad",
          "sharedvideo",
          "settings",
          "raisehand",
          "videoquality",
          "filmstrip",
          "invite",
          "feedback",
          "stats",
          "shortcuts",
          "tileview",
          "videobackgroundblur",
          "download",
          "help",
          "mute-everyone",
        ],
        ...options.interfaceConfig,
      },
      userInfo: {
        displayName: displayName,
        email: options.email || "",
      },
    }

    return {
      url: `https://${domain}/${config.roomName}`,
      config: config,
      embedUrl: `https://${domain}/${config.roomName}#config.startWithAudioMuted=${config.configOverwrite.startWithAudioMuted}&config.startWithVideoMuted=${config.configOverwrite.startWithVideoMuted}`,
    }
  },

  // Create meeting for pod with improved error handling
  async createPodMeeting(podId: string, userId: string, title: string) {
    try {
      const pod = await podService.getPodDetails(podId)
      const user = await profileService.getProfile(userId)

      const roomName = `peerspark-${podId}-${Date.now()}`
      const meeting = this.generateMeetingUrl(roomName, user.name || "User", {
        startMuted: true,
        startVideoMuted: false,
      })

      // Create calendar event for the meeting
      await calendarService.createEvent(
        userId,
        `${title} - ${pod.name}`,
        `Video meeting for ${pod.name} pod`,
        new Date().toISOString(),
        new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        {
          type: "meeting",
          podId: podId,
          meetingUrl: meeting.url,
          attendees: pod.members || [],
        },
      )

      // Notify pod members
      if (pod.members && Array.isArray(pod.members)) {
        await Promise.all(
          pod.members
            .filter((memberId: string) => memberId !== userId)
            .map((memberId: string) =>
              notificationService.createNotification(
                memberId,
                "Meeting Started",
                `${user.name || "Someone"} started a meeting in ${pod.name}`,
                "meeting",
                {
                  actionUrl: meeting.url,
                  actionText: "Join Meeting",
                  podId: podId,
                },
              ),
            ),
        )
      }

      return meeting
    } catch (error) {
      console.error("Create pod meeting error:", error)
      throw error
    }
  },

  // Create direct meeting
  async createDirectMeeting(userId1: string, userId2: string) {
    try {
      const user1 = await profileService.getProfile(userId1)
      const user2 = await profileService.getProfile(userId2)

      const roomName = `peerspark-direct-${[userId1, userId2].sort().join("-")}-${Date.now()}`
      const meeting = this.generateMeetingUrl(roomName, user1.name || "User")

      // Notify the other user
      await notificationService.createNotification(
        userId2,
        "Video Call",
        `${user1.name || "Someone"} is calling you`,
        "call",
        {
          actionUrl: meeting.url,
          actionText: "Join Call",
          callerId: userId1,
        },
      )

      return meeting
    } catch (error) {
      console.error("Create direct meeting error:", error)
      throw error
    }
  },
}

export default client
