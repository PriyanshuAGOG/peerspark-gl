import { Client, Databases, ID, Query, RealtimeResponseEvent } from 'appwrite'
import { databases } from '../appwrite'

export interface ChatRoom {
  $id: string
  roomId: string
  name?: string
  type: 'direct' | 'group' | 'pod' | 'ai'
  participants: string[]
  avatar?: string
  description?: string
  createdBy: string
  podId?: string
  lastMessageId?: string
  lastActivity?: string
  messageCount: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface ChatMessage {
  $id: string
  messageId: string
  roomId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'system' | 'ai'
  replyToId?: string
  attachments?: any[]
  mentions?: string[]
  isAI: boolean
  aiModel?: string
  isEdited: boolean
  isDeleted: boolean
  readBy?: string[]
  createdAt: string
  updatedAt?: string
}

export class ChatService {
  private client: Client
  private databases: Databases
  private subscriptions: Map<string, () => void> = new Map()

  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

    this.databases = new Databases(this.client)
  }

  // Create or get direct message room
  async createDirectRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    try {
      // Check if room already exists
      const participants = [userId1, userId2].sort()
      const existingRooms = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        [
          Query.equal('type', 'direct'),
          Query.contains('participants', participants[0]),
          Query.contains('participants', participants[1])
        ]
      )

      if (existingRooms.documents.length > 0) {
        return existingRooms.documents[0] as ChatRoom
      }

      // Create new room
      const roomId = ID.unique()
      const room = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        ID.unique(),
        {
          roomId,
          type: 'direct',
          participants: JSON.stringify(participants),
          createdBy: userId1,
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      )

      return room as ChatRoom
    } catch (error) {
      console.error('Error creating direct room:', error)
      throw error
    }
  }

  // Create group chat room
  async createGroupRoom(
    name: string,
    participants: string[],
    createdBy: string,
    description?: string
  ): Promise<ChatRoom> {
    try {
      const roomId = ID.unique()
      const room = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        ID.unique(),
        {
          roomId,
          name,
          type: 'group',
          participants: JSON.stringify(participants),
          description: description || '',
          createdBy,
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      )

      return room as ChatRoom
    } catch (error) {
      console.error('Error creating group room:', error)
      throw error
    }
  }

  // Create AI chat room
  async createAIRoom(userId: string): Promise<ChatRoom> {
    try {
      const roomId = ID.unique()
      const room = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        ID.unique(),
        {
          roomId,
          name: 'AI Assistant',
          type: 'ai',
          participants: JSON.stringify([userId, 'ai-assistant']),
          createdBy: userId,
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      )

      return room as ChatRoom
    } catch (error) {
      console.error('Error creating AI room:', error)
      throw error
    }
  }

  // Get user's chat rooms
  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        [
          Query.contains('participants', userId),
          Query.equal('isActive', true),
          Query.orderDesc('lastActivity')
        ]
      )

      return response.documents.map(doc => {
        const room = doc as ChatRoom
        room.participants = JSON.parse(room.participants as any)
        return room
      })
    } catch (error) {
      console.error('Error fetching user rooms:', error)
      return []
    }
  }

  // Send message
  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: ChatMessage['type'] = 'text',
    replyToId?: string,
    attachments?: any[],
    mentions?: string[]
  ): Promise<ChatMessage> {
    try {
      const messageId = ID.unique()
      const message = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        ID.unique(),
        {
          messageId,
          roomId,
          senderId,
          content,
          type,
          replyToId: replyToId || '',
          attachments: JSON.stringify(attachments || []),
          mentions: JSON.stringify(mentions || []),
          isAI: false,
          isEdited: false,
          isDeleted: false,
          readBy: JSON.stringify([senderId]),
          createdAt: new Date().toISOString()
        }
      )

      // Update room's last message and activity
      await this.updateRoomActivity(roomId, messageId)

      // Check for AI mentions and trigger AI response
      if (mentions?.includes('ai') || mentions?.includes('@ai')) {
        this.triggerAIResponse(roomId, content, messageId)
      }

      return message as ChatMessage
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Get room messages
  async getRoomMessages(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('roomId', roomId),
          Query.equal('isDeleted', false),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      )

      return response.documents.map(doc => {
        const message = doc as ChatMessage
        message.attachments = JSON.parse(message.attachments as any) || []
        message.mentions = JSON.parse(message.mentions as any) || []
        message.readBy = JSON.parse(message.readBy as any) || []
        return message
      }).reverse()
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    try {
      // Get current message
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('messageId', messageId)
        ]
      )

      if (response.documents.length === 0) return

      const message = response.documents[0] as ChatMessage
      const readBy = JSON.parse(message.readBy as any) || []

      if (!readBy.includes(userId)) {
        readBy.push(userId)

        await this.databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
          message.$id,
          {
            readBy: JSON.stringify(readBy)
          }
        )
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Update room activity
  private async updateRoomActivity(roomId: string, lastMessageId: string) {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
        [
          Query.equal('roomId', roomId)
        ]
      )

      if (response.documents.length > 0) {
        const room = response.documents[0]
        await this.databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
          room.$id,
          {
            lastMessageId,
            lastActivity: new Date().toISOString(),
            messageCount: room.messageCount + 1
          }
        )
      }
    } catch (error) {
      console.error('Error updating room activity:', error)
    }
  }

  // Trigger AI response
  private async triggerAIResponse(roomId: string, userMessage: string, replyToId: string) {
    try {
      // Call AI function
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          message: userMessage,
          replyToId
        })
      })

      if (!response.ok) {
        throw new Error('AI response failed')
      }

      const aiResponse = await response.json()

      // Send AI message
      await this.sendAIMessage(roomId, aiResponse.content, replyToId)
    } catch (error) {
      console.error('Error triggering AI response:', error)
    }
  }

  // Send AI message
  async sendAIMessage(
    roomId: string,
    content: string,
    replyToId?: string
  ): Promise<ChatMessage> {
    try {
      const messageId = ID.unique()
      const message = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        ID.unique(),
        {
          messageId,
          roomId,
          senderId: 'ai-assistant',
          content,
          type: 'ai',
          replyToId: replyToId || '',
          attachments: JSON.stringify([]),
          mentions: JSON.stringify([]),
          isAI: true,
          aiModel: 'gpt-4',
          isEdited: false,
          isDeleted: false,
          readBy: JSON.stringify(['ai-assistant']),
          createdAt: new Date().toISOString()
        }
      )

      // Update room activity
      await this.updateRoomActivity(roomId, messageId)

      return message as ChatMessage
    } catch (error) {
      console.error('Error sending AI message:', error)
      throw error
    }
  }

  // Subscribe to room messages
  subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onUpdate: (message: ChatMessage) => void,
    onDelete: (messageId: string) => void
  ) {
    const subscriptionKey = `room-${roomId}`

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey)!()
    }

    const unsubscribe = this.client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID}.documents`,
      (response: RealtimeResponseEvent<ChatMessage>) => {
        const message = response.payload

        // Only handle messages for this room
        if (message.roomId !== roomId) return

        // Parse JSON fields
        message.attachments = JSON.parse(message.attachments as any) || []
        message.mentions = JSON.parse(message.mentions as any) || []
        message.readBy = JSON.parse(message.readBy as any) || []

        switch (response.events[0]) {
          case 'databases.*.collections.*.documents.*.create':
            onMessage(message)
            break
          case 'databases.*.collections.*.documents.*.update':
            onUpdate(message)
            break
          case 'databases.*.collections.*.documents.*.delete':
            onDelete(message.messageId)
            break
        }
      }
    )

    this.subscriptions.set(subscriptionKey, unsubscribe)
    return unsubscribe
  }

  // Unsubscribe from room
  unsubscribeFromRoom(roomId: string) {
    const subscriptionKey = `room-${roomId}`
    const unsubscribe = this.subscriptions.get(subscriptionKey)
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(subscriptionKey)
    }
  }

  // Edit message
  async editMessage(messageId: string, newContent: string) {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('messageId', messageId)
        ]
      )

      if (response.documents.length === 0) {
        throw new Error('Message not found')
      }

      const message = response.documents[0]
      await this.databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        message.$id,
        {
          content: newContent,
          isEdited: true,
          updatedAt: new Date().toISOString()
        }
      )
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }

  // Delete message
  async deleteMessage(messageId: string) {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('messageId', messageId)
        ]
      )

      if (response.documents.length === 0) {
        throw new Error('Message not found')
      }

      const message = response.documents[0]
      await this.databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        message.$id,
        {
          content: 'This message was deleted',
          isDeleted: true,
          updatedAt: new Date().toISOString()
        }
      )
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  // Search messages
  async searchMessages(
    roomId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('roomId', roomId),
          Query.search('content', query),
          Query.equal('isDeleted', false),
          Query.limit(limit),
          Query.orderDesc('createdAt')
        ]
      )

      return response.documents.map(doc => {
        const message = doc as ChatMessage
        message.attachments = JSON.parse(message.attachments as any) || []
        message.mentions = JSON.parse(message.mentions as any) || []
        message.readBy = JSON.parse(message.readBy as any) || []
        return message
      })
    } catch (error) {
      console.error('Error searching messages:', error)
      return []
    }
  }

  // Get unread message count
  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    try {
      const response = await this.databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [
          Query.equal('roomId', roomId),
          Query.equal('isDeleted', false),
          Query.notEqual('senderId', userId)
        ]
      )

      let unreadCount = 0
      for (const doc of response.documents) {
        const message = doc as ChatMessage
        const readBy = JSON.parse(message.readBy as any) || []
        if (!readBy.includes(userId)) {
          unreadCount++
        }
      }

      return unreadCount
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const chatService = new ChatService()
