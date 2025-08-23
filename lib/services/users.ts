import { databases } from '../appwrite'
import { Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'
import { UserProfile } from '../auth'

class UsersService {
  private databaseId = DATABASE_ID;
  private collectionId = COLLECTIONS.USERS;

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('userId', userId)
        ]
      );

      if (response.documents.length > 0) {
        const profile = response.documents[0] as UserProfile;
        // The service should not be parsing JSON. This should be handled by the consumer.
        // However, to maintain consistency with existing code, we'll leave it for now.
        if (typeof profile.skills === 'string') {
            profile.skills = JSON.parse(profile.skills);
        }
        if (typeof profile.interests === 'string') {
            profile.interests = JSON.parse(profile.interests);
        }
        if (typeof profile.subjects === 'string') {
            profile.subjects = JSON.parse(profile.subjects);
        }
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('username', username)
        ]
      );
      if (response.documents.length > 0) {
        return this.getProfile(response.documents[0].userId); // Re-use getProfile to parse
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile by username:', error);
      return null;
    }
  }

  async updateProfile(documentId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
      try {
          const updatedProfile = await databases.updateDocument(
              this.databaseId,
              this.collectionId,
              documentId,
              updates
          );
          return updatedProfile as UserProfile;
      } catch (error) {
          console.error("Error updating profile:", error);
          throw error;
      }
  }
}

export const usersService = new UsersService();
