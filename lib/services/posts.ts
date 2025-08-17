import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface Post {
  $id: string
  postId: string
  authorId: string
  title?: string
  content: string
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'question' | 'resource'
  mediaUrls?: string[]
  thumbnailUrl?: string
  tags: string[]
  category?: string
  subject?: string
  podId?: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  bookmarksCount: number
  viewsCount: number
  isPublic: boolean
  allowComments: boolean
  isPinned: boolean
  isEdited: boolean
  createdAt: string
  updatedAt?: string
  scheduledAt?: string
}

class PostsService {
  private databaseId = DATABASE_ID
  private collectionId = COLLECTIONS.POSTS

  // Create post
  async createPost(postData: Omit<Post, '$id' | 'postId' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'bookmarksCount' | 'viewsCount' | 'isPinned' | 'isEdited' | 'createdAt'>): Promise<Post> {
    try {
      const postId = ID.unique()
      const post = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          postId,
          ...postData,
          tags: JSON.stringify(postData.tags || []),
          mediaUrls: JSON.stringify(postData.mediaUrls || []),
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          bookmarksCount: 0,
          viewsCount: 0,
          isPublic: postData.isPublic ?? true,
          allowComments: postData.allowComments ?? true,
          isPinned: false,
          isEdited: false,
          createdAt: new Date().toISOString()
        }
      )

      return this.parsePost(post as any)
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  // Get feed posts
  async getFeedPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('isPublic', true),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      )

      return response.documents.map(doc => this.parsePost(doc as any))
    } catch (error) {
      console.error('Error fetching feed posts:', error)
      return []
    }
  }

  // Get user posts
  async getUserPosts(userId: string, limit: number = 20): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('authorId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      )

      return response.documents.map(doc => this.parsePost(doc as any))
    } catch (error) {
      console.error('Error fetching user posts:', error)
      return []
    }
  }

  // Get single post
  async getPost(postId: string): Promise<Post | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('postId', postId)]
      )

      if (response.documents.length === 0) return null

      return this.parsePost(response.documents[0] as any)
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  }

  // Update post
  async updatePost(documentId: string, updates: Partial<Post>): Promise<Post> {
    try {
      const processedUpdates = { ...updates }
      if (processedUpdates.tags) {
        processedUpdates.tags = JSON.stringify(processedUpdates.tags) as any
      }
      if (processedUpdates.mediaUrls) {
        processedUpdates.mediaUrls = JSON.stringify(processedUpdates.mediaUrls) as any
      }

      const updatedPost = await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        documentId,
        {
          ...processedUpdates,
          isEdited: true,
          updatedAt: new Date().toISOString()
        }
      )

      return this.parsePost(updatedPost as any)
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  }

  // Delete post
  async deletePost(documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        documentId
      )
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // Search posts
  async searchPosts(query: string, limit: number = 20): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.search('content', query),
          Query.equal('isPublic', true),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      )

      return response.documents.map(doc => this.parsePost(doc as any))
    } catch (error) {
      console.error('Error searching posts:', error)
      return []
    }
  }

  // Get posts by category
  async getPostsByCategory(category: string, limit: number = 20): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('category', category),
          Query.equal('isPublic', true),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      )

      return response.documents.map(doc => this.parsePost(doc as any))
    } catch (error) {
      console.error('Error fetching posts by category:', error)
      return []
    }
  }

  // Get trending posts
  async getTrendingPosts(limit: number = 20): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('isPublic', true),
          Query.orderDesc('likesCount'),
          Query.orderDesc('commentsCount'),
          Query.limit(limit)
        ]
      )

      return response.documents.map(doc => this.parsePost(doc as any))
    } catch (error) {
      console.error('Error fetching trending posts:', error)
      return []
    }
  }

  // Parse post document
  private parsePost(doc: any): Post {
    return {
      ...doc,
      tags: JSON.parse(doc.tags || '[]'),
      mediaUrls: JSON.parse(doc.mediaUrls || '[]')
    }
  }
}

export const postsService = new PostsService()
