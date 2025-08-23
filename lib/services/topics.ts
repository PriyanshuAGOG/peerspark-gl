import { databases } from '../appwrite'
import { Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

// This assumes a 'trending_topics' collection exists.
// Documents in this collection could have fields like 'tag' and 'postCount'.
// This collection would be populated by a recurring Appwrite Function
// that aggregates tags from the 'posts' collection.

export interface TrendingTopic {
  $id: string;
  tag: string;
  postCount: number;
}

class TopicsService {
  private db = DATABASE_ID;
  // We need to add TRENDING_TOPICS to our COLLECTIONS object in appwrite.ts
  private collectionId = 'trending_topics';

  async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    try {
      const response = await databases.listDocuments(
        this.db,
        this.collectionId,
        [
          Query.orderDesc('postCount'),
          Query.limit(limit)
        ]
      );
      return response.documents as TrendingTopic[];
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      // It's common for this collection to not exist in dev, so we'll fail gracefully.
      return [];
    }
  }
}

export const topicsService = new TopicsService();
