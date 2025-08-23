import { Client, Databases, ID, Query, RealtimeResponseEvent } from 'appwrite'
import { databases } from '../appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

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

class ChatService {
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
      const participants = [userId1, userId2].sort()
      const existingRooms = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAT_ROOMS,
        [
          Query.equal('type', 'direct'),
          Query.search('participants', participants[0]),
          Query.search('participants', participants[1])
        ]
      )

      if (existingRooms.documents.length > 0) {
        return this.parseRoom(existingRooms.documents[0] as any)
      }

      const roomId = ID.unique()
      const room = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_ROOMS,
        roomId,
        {
          roomId,
          type: 'direct',
          participants: participants,
          createdBy: userId1,
          messageCount: 0,
          isActive: true,
        }
      )

      return this.parseRoom(room as any)
    } catch (error) {
      console.error('Error creating direct room:', error)
      throw error
    }
  }

  // Get user's chat rooms
  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const response = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAT_ROOMS,
        [
          Query.search('participants', userId),
          Query.equal('isActive', true),
          Query.orderDesc('lastActivity')
        ]
      )

      return response.documents.map(doc => this.parseRoom(doc as any))
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
    type: ChatMessage['type'] = 'text'
  ): Promise<ChatMessage> {
    try {
      const messageId = ID.unique()
      const message = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId,
        {
          messageId,
          roomId,
          senderId,
          content,
          type,
          isAI: false,
          isEdited: false,
          isDeleted: false,
          readBy: [senderId],
        }
      )

      await this.updateRoomActivity(roomId, messageId)

      return this.parseMessage(message as any)
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
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('roomId', roomId),
          Query.equal('isDeleted', false),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      )

      return response.documents.map(doc => this.parseMessage(doc as any)).reverse()
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  private async updateRoomActivity(roomId: string, lastMessageId: string) {
    try {
        await this.databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CHAT_ROOMS,
            roomId,
            {
                lastMessageId,
                lastActivity: new Date().toISOString(),
            }
        );
    } catch (error) {
        console.error('Error updating room activity:', error);
    }
  }

  subscribeToRoom(
    roomId: string,
    callback: (message: ChatMessage) => void
  ) {
      const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`

      return this.client.subscribe(channel, (response) => {
          const message = this.parseMessage(response.payload as any);
          if (message.roomId === roomId) {
              callback(message);
          }
      });
  }

  private parseRoom(doc: any): ChatRoom {
      return {
          ...doc,
          participants: doc.participants || [],
      }
  }

  private parseMessage(doc: any): ChatMessage {
      return {
          ...doc,
          attachments: doc.attachments ? JSON.parse(doc.attachments) : [],
          mentions: doc.mentions ? JSON.parse(doc.mentions) : [],
          readBy: doc.readBy || [],
      }
  }
}

export const chatService = new ChatService()
