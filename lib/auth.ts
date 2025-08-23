import { Client, Account, ID, Models, Query } from 'appwrite'
import { databases } from './appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)

export interface UserProfile extends Models.Document {
  userId: string
  email: string
  username: string
  displayName: string
  firstName: string
  lastName: string
  bio?: string
  avatar?: string
  coverImage?: string
  location?: string
  website?: string
  institution?: string
  major?: string
  graduationYear?: string
  jobTitle?: string
  company?: string
  skills: string[]
  interests: string[]
  subjects: string[]
  followersCount: number
  followingCount: number
  postsCount: number
  reputationScore: number
  isVerified: boolean
  isPrivate: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  hasBetaAccess: boolean
  lastActive?: string
  joinedAt: string
}

export class AuthService {
  // Register new user
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) {
    try {
      // Create account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      )

      // Create email session
      await account.createEmailSession(email, password)

      // Create user profile in database
      const userProfile = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        ID.unique(),
        {
          userId: user.$id,
          email,
          username,
          displayName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          bio: '',
          avatar: '',
          coverImage: '',
          location: '',
          website: '',
          institution: '',
          major: '',
          graduationYear: '',
          jobTitle: '',
          company: '',
          skills: JSON.stringify([]),
          interests: JSON.stringify([]),
          subjects: JSON.stringify([]),
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          reputationScore: 0,
          isVerified: false,
          isPrivate: false,
          emailNotifications: true,
          pushNotifications: true,
          hasBetaAccess: false,
          joinedAt: new Date().toISOString(),
        }
      )

      return { user, profile: userProfile }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailSession(email, password)
      const user = await account.get()
      const profile = await this.getUserProfile(user.$id)

      return { user, profile, session }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get()
      const profile = await this.getUserProfile(user.$id)
      return { user, profile }
    } catch (error) {
      return null
    }
  }

  // Get user profile from database
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [
          Query.equal('userId', userId)
        ]
      )

      if (response.documents.length > 0) {
        const profile = response.documents[0] as UserProfile
        // Parse JSON fields
        if (typeof profile.skills === 'string') profile.skills = JSON.parse(profile.skills)
        if (typeof profile.interests === 'string') profile.interests = JSON.parse(profile.interests)
        if (typeof profile.subjects === 'string') profile.subjects = JSON.parse(profile.subjects)
        return profile
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      // Find user document
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [
          Query.equal('userId', userId)
        ]
      )

      if (response.documents.length === 0) {
        throw new Error('User profile not found')
      }

      const documentId = response.documents[0].$id

      // Stringify array fields if they exist
      const processedUpdates = { ...updates }
      if (processedUpdates.skills) {
        processedUpdates.skills = JSON.stringify(processedUpdates.skills) as any
      }
      if (processedUpdates.interests) {
        processedUpdates.interests = JSON.stringify(processedUpdates.interests) as any
      }
      if (processedUpdates.subjects) {
        processedUpdates.subjects = JSON.stringify(processedUpdates.subjects) as any
      }

      const updatedProfile = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        documentId,
        processedUpdates
      )

      return updatedProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      await account.updatePassword(newPassword, oldPassword)
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      )
    } catch (error) {
      console.error('Error sending password recovery:', error)
      throw error
    }
  }

  // Complete password recovery
  async completePasswordRecovery(
    userId: string,
    secret: string,
    newPassword: string
  ) {
    try {
      await account.updateRecovery(userId, secret, newPassword, newPassword)
    } catch (error) {
      console.error('Error completing password recovery:', error)
      throw error
    }
  }

  // Email verification
  async sendEmailVerification() {
    try {
      await account.createVerification(
        `${window.location.origin}/verify-email`
      )
    } catch (error) {
      console.error('Error sending email verification:', error)
      throw error
    }
  }

  // Complete email verification
  async completeEmailVerification(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret)
    } catch (error) {
      console.error('Error completing email verification:', error)
      throw error
    }
  }

  // OAuth login
  async loginWithOAuth(provider: 'google' | 'github' | 'discord') {
    try {
      account.createOAuth2Session(
        provider,
        `${window.location.origin}/app/dashboard`,
        `${window.location.origin}/login?error=oauth_failed`
      )
    } catch (error) {
      console.error('OAuth login error:', error)
      throw error
    }
  }

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [
          Query.equal('username', username)
        ]
      )
      return response.documents.length === 0
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }

  // Update last active timestamp
  async updateLastActive(userId: string) {
    try {
      await this.updateProfile(userId, {
        lastActive: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating last active:', error)
    }
  }
}

export const authService = new AuthService()
