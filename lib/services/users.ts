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
        // Parse JSON fields
        profile.skills = JSON.parse(profile.skills as any || '[]');
        profile.interests = JSON.parse(profile.interests as any || '[]');
        profile.subjects = JSON.parse(profile.subjects as any || '[]');
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}

export const usersService = new UsersService();
