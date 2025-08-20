import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'
import { questsService } from './quests'
import { notificationService } from './notifications'

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

  async awardAchievement(userId: string, achievementId: string, achievementName: string): Promise<UserAchievement> {
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
      await notificationService.createNotification({
          userId,
          title: "Achievement Unlocked!",
          message: `You've earned the achievement: ${achievementName}`,
          type: 'success',
          actionUrl: `/app/profile/${userId}?tab=achievements`
      });
      return userAchievement as UserAchievement;
    } catch (error) {
      console.error("Error awarding achievement:", error);
      throw error;
    }
  }

  async checkAndAwardQuestAchievements(userId: string) {
    try {
        const [allAchievements, userAchievements, questProgress] = await Promise.all([
            this.getAchievements(),
            this.getUserAchievements(userId),
            questsService.getAllQuestProgressForUser(userId)
        ]);

        const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
        const completedQuestsCount = questProgress.filter(p => p.status === 'completed').length;

        const questAchievements = allAchievements.filter(a => a.criteria.type === 'quests_completed');

        for (const achievement of questAchievements) {
            if (!earnedAchievementIds.has(achievement.$id)) {
                if (completedQuestsCount >= achievement.criteria.count) {
                    await this.awardAchievement(userId, achievement.$id, achievement.name);
                }
            }
        }
    } catch (error) {
        console.error("Error checking for quest achievements:", error);
    }
  }
}

export const achievementsService = new AchievementsService();
