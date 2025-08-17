import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

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

class QuestsService {
  private databaseId = DATABASE_ID;
  private collectionId = COLLECTIONS.QUESTS; // Assuming you add QUESTS to your COLLECTIONS object

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

  async getQuest(questId: string): Promise<Quest | null> {
      try {
          const quest = await databases.getDocument(this.databaseId, this.collectionId, questId);
          return quest as Quest;
      } catch (error) {
          console.error("Error fetching quest:", error);
          return null;
      }
  }
}

export const questsService = new QuestsService();
