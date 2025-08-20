import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'
import { usersService } from './users'
import { achievementsService } from './achievements'

export interface Quest {
  $id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'quest';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  podId: string;
  content: string; // For lessons
  questions?: string; // JSON string for quiz questions
  starterCode?: string; // For coding quests
  testCases?: string; // JSON string for coding quest test cases
  hints?: string[];
  timeLimit?: number; // in minutes
  isActive: boolean;
  createdAt: string;
}

export interface QuestProgress {
    $id: string;
    userId: string;
    questId: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'failed';
    score?: number;
    answers?: string; // JSON string of answers
    codeSubmission?: string;
    startedAt: string;
    completedAt?: string;
}

class QuestsService {
  private databaseId = DATABASE_ID;
  private questsCollectionId = COLLECTIONS.QUESTS;
  private progressCollectionId = COLLECTIONS.QUEST_PROGRESS;

  async createQuest(questData: Omit<Quest, '$id' | 'createdAt' | 'isActive'>): Promise<Quest> {
    try {
      const quest = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          ...questData,
          isActive: true,
        }
      );
      return quest as Quest;
    } catch (error) {
      console.error("Error creating quest:", error);
      throw error;
    }
  }

  async getQuestsForPod(podId: string): Promise<Quest[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('podId', podId),
          Query.equal('isActive', true),
          Query.orderAsc('$createdAt')
        ]
      );
      return response.documents as Quest[];
    } catch (error) {
      console.error("Error fetching quests for pod:", error);
      return [];
    }
  }

  async getAllQuests(): Promise<Quest[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.questsCollectionId,
        [Query.limit(100)] // Adjust limit as needed
      );
      return response.documents as Quest[];
    } catch (error) {
      console.error("Error fetching all quests:", error);
      return [];
    }
  }

  async getQuest(questId: string): Promise<Quest | null> {
      try {
          const quest = await databases.getDocument(this.databaseId, this.collectionId, questId);
          return quest as Quest;
      } catch (error) {
          console.error("Error fetching quest:", error);
          return null;
      }
  }

  async startQuest(userId: string, questId: string): Promise<QuestProgress> {
      try {
          const progress = await databases.createDocument(this.databaseId, this.progressCollectionId, ID.unique(), {
              userId,
              questId,
              status: 'in-progress',
              startedAt: new Date().toISOString(),
          });
          return progress as QuestProgress;
      } catch (error) {
          console.error("Error starting quest:", error);
          throw error;
      }
  }

  async submitQuest(progressId: string, submission: { answers?: string; codeSubmission?: string; score?: number }): Promise<QuestProgress> {
      try {
          const progressDoc = await databases.updateDocument(this.databaseId, this.progressCollectionId, progressId, {
              ...submission,
              status: 'completed',
              completedAt: new Date().toISOString(),
          });

          const progress = progressDoc as QuestProgress;

          // Award points
          const quest = await this.getQuest(progress.questId);
          if (quest && quest.points > 0) {
              const userProfile = await usersService.getProfile(progress.userId);
              if (userProfile) {
                  const newScore = (userProfile.reputationScore || 0) + quest.points;
                  await usersService.updateProfile(userProfile.$id, { reputationScore: newScore });
              }
          }

          // Check for achievements
          await achievementsService.checkAndAwardQuestAchievements(progress.userId);

          return progress;
      } catch (error) {
          console.error("Error submitting quest:", error);
          throw error;
      }
  }

  async getQuestProgressForUser(userId: string, questId: string): Promise<QuestProgress | null> {
      try {
          const response = await databases.listDocuments(this.databaseId, this.progressCollectionId, [
              Query.equal('userId', userId),
              Query.equal('questId', questId),
          ]);
          if (response.documents.length > 0) {
              return response.documents[0] as QuestProgress;
          }
          return null;
      } catch (error) {
          console.error("Error getting quest progress:", error);
          return null;
      }
  }

  async getAllQuestProgressForUser(userId: string): Promise<QuestProgress[]> {
    try {
        const response = await databases.listDocuments(this.databaseId, this.progressCollectionId, [
            Query.equal('userId', userId),
        ]);
        return response.documents as QuestProgress[];
    } catch (error) {
        console.error("Error getting all quest progress for user:", error);
        return [];
    }
  }
}

export const questsService = new QuestsService();
