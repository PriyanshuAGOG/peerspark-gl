import { ID, Models, Query } from 'appwrite'
import { account, databases } from './appwrite' // Use the central instances

// Re-export for convenience if needed elsewhere, but authService is the primary export
export { account };

export interface UserProfile extends Models.Document {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  institution?: string;
  major?: string;
  graduationYear?: string;
  jobTitle?: string;
  company?: string;
  skills: string[];
  interests: string[];
  subjects: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reputationScore: number;
  isVerified: boolean;
  isPrivate: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  hasBetaAccess: boolean;
  plan: 'free' | 'student' | 'pro' | 'influencer' | 'creator';
  lastActive?: string;
  joinedAt: string;
}

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) {
    try {
      const user = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      );

      await account.createEmailPasswordSession(email, password);

      const userProfile = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        user.$id, // Use the user's account ID as the document ID
        {
          userId: user.$id,
          email,
          username,
          displayName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          plan: 'free',
          hasBetaAccess: false,
          skills: [],
          interests: [],
          subjects: [],
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          reputationScore: 0,
          isVerified: false,
          isPrivate: false,
          emailNotifications: true,
          pushNotifications: true,
          joinedAt: new Date().toISOString(),
        }
      );

      return { user, profile: userProfile };
    } catch (error: any) {
      // If user already exists, throw a more specific error
      if (error.code === 409) {
        throw new Error("A user with this email already exists. Please log in.");
      }
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // Appwrite automatically manages sessions, creating a new one will invalidate the old.
      // Defensively deleting is not required and can hide other issues.
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const profile = await this.getUserProfile(user.$id);
      return { user, profile, session };
    } catch (error) {
      console.error('Login error:', error);
      // Make error message more generic for security
      if (error instanceof Error && (error.message.includes('Invalid credentials') || error.message.includes('401'))) {
          throw new Error('Invalid email or password.');
      }
      throw error;
    }
  }

  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const user = await account.get();
      const profile = await this.getUserProfile(user.$id);
      return { user, profile };
    } catch (error) {
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Direct lookup by document ID is more efficient
      const profile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        userId
      );
      return profile as UserProfile;
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
       // Direct update by document ID
      const updatedProfile = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        userId, // Assumes profile document ID is the same as user ID
        updates
      );
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async sendPasswordRecovery(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      console.error('Error sending password recovery:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
