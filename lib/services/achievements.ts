import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface Achievement {
  $id: string;
  name: string;
  description: string;
  icon: string;
  criteria: object; // JSON object defining the criteria
}

export interface UserAchievement {
  $id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
}

class AchievementsService {
  private db = DATABASE_ID;
  private achievementsCollection = COLLECTIONS.ACHIEVEMENTS;
  private userAchievementsCollection = COLLECTIONS.USER_ACHIEVEMENTS;

  async getAchievements(): Promise<Achievement[]> {
    try {
      const response = await databases.listDocuments(this.db, this.achievementsCollection);
      return response.documents as Achievement[];
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const response = await databases.listDocuments(this.db, this.userAchievementsCollection, [
        Query.equal('userId', userId)
      ]);
      return response.documents as UserAchievement[];
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    try {
      // Check if user already has this achievement
      const existing = await databases.listDocuments(this.db, this.userAchievementsCollection, [
        Query.equal('userId', userId),
        Query.equal('achievementId', achievementId)
      ]);
      if (existing.documents.length > 0) {
        return existing.documents[0] as UserAchievement;
      }

      const userAchievement = await databases.createDocument(
        this.db,
        this.userAchievementsCollection,
        ID.unique(),
        {
          userId,
          achievementId,
          earnedAt: new Date().toISOString(),
        }
      );
      // TODO: Maybe send a notification
      return userAchievement as UserAchievement;
    } catch (error) {
      console.error("Error awarding achievement:", error);
      throw error;
    }
  }
}

export const achievementsService = new AchievementsService();
