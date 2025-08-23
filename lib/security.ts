import { databases } from './appwrite'
import { Query } from 'appwrite'

export class SecurityService {
  // Check if user can access resource
  async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<boolean> {
    try {
      switch (resourceType) {
        case 'post':
          return await this.canAccessPost(userId, resourceId, action)
        case 'message':
          return await this.canAccessMessage(userId, resourceId, action)
        case 'room':
          return await this.canAccessRoom(userId, resourceId, action)
        case 'profile':
          return await this.canAccessProfile(userId, resourceId, action)
        default:
          return false
      }
    } catch (error) {
      console.error('Security check error:', error)
      return false
    }
  }

  // Check post access
  private async canAccessPost(
    userId: string,
    postId: string,
    action: string
  ): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!,
        [Query.equal('postId', postId)]
      )

      if (response.documents.length === 0) return false

      const post = response.documents[0]

      // Public posts can be read by anyone
      if (action === 'read' && post.isPublic) return true

      // Author can do anything
      if (post.authorId === userId) return true

      // For private posts, check if user is following author
      if (!post.isPublic) {
        return await this.isFollowing(userId, post.authorId)
      }

      return false
    } catch (error) {
      return false
    }
  }

  // Check message access
  private async canAccessMessage(
    userId: string,
    messageId: string,
    action: string
  ): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [Query.equal('messageId', messageId)]
      )

      if (response.documents.length === 0) return false

      const message = response.documents[0]

      // Check if user is participant in the room
      return await this.canAccessRoom(userId, message.roomId, action)
    } catch (error) {
      return false
    }
  }

  // Check room access
  private async canAccessRoom(
    userId: string,
    roomId: string,
    action: string
  ): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        [Query.equal('roomId', roomId)]
      )

      if (response.documents.length === 0) return false

      const room = response.documents[0]
      const participants = JSON.parse(room.participants)

      return participants.includes(userId)
    } catch (error) {
      return false
    }
  }

  // Check profile access
  private async canAccessProfile(
    userId: string,
    profileUserId: string,
    action: string
  ): Promise<boolean> {
    try {
      // Users can always access their own profile
      if (userId === profileUserId) return true

      // Get profile privacy settings
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [Query.equal('userId', profileUserId)]
      )

      if (response.documents.length === 0) return false

      const profile = response.documents[0]

      // Public profiles can be read by anyone
      if (action === 'read' && !profile.isPrivate) return true

      // For private profiles, check if user is following
      if (profile.isPrivate) {
        return await this.isFollowing(userId, profileUserId)
      }

      return false
    } catch (error) {
      return false
    }
  }

  // Check if user is following another user
  private async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_FOLLOWS_COLLECTION_ID!,
        [
          Query.equal('followerId', followerId),
          Query.equal('followingId', followingId)
        ]
      )

      return response.documents.length > 0
    } catch (error) {
      return false
    }
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }

  // Validate file upload
  validateFileUpload(file: File, allowedTypes: string[], maxSize: number): boolean {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      return false
    }

    return true
  }

  // Rate limiting check
  async checkRateLimit(
    userId: string,
    action: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> {
    try {
      const windowStart = new Date(Date.now() - windowMs).toISOString()

      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_COLLECTION_ID!,
        [
          Query.equal('userId', userId),
          Query.equal('eventType', action),
          Query.greaterThan('timestamp', windowStart)
        ]
      )

      return response.documents.length < limit
    } catch (error) {
      return true // Allow on error
    }
  }

  // Content moderation
  async moderateContent(content: string): Promise<{
    isAllowed: boolean
    reason?: string
  }> {
    // Basic content filtering
    const bannedWords = [
      'spam', 'scam', 'hack', 'cheat', 'illegal'
      // Add more banned words as needed
    ]

    const lowerContent = content.toLowerCase()

    for (const word of bannedWords) {
      if (lowerContent.includes(word)) {
        return {
          isAllowed: false,
          reason: `Content contains prohibited word: ${word}`
        }
      }
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capsRatio > 0.7 && content.length > 10) {
      return {
        isAllowed: false,
        reason: 'Excessive use of capital letters'
      }
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      return {
        isAllowed: false,
        reason: 'Excessive repeated characters'
      }
    }

    return { isAllowed: true }
  }

  // Generate secure token
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Hash sensitive data
  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export const securityService = new SecurityService()
