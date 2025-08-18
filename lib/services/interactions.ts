import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface Like {
  $id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'resource';
}

export interface Bookmark {
  $id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'resource' | 'event';
}

class InteractionsService {
  private db = DATABASE_ID;

  async like(userId: string, targetId: string, targetType: Like['targetType']): Promise<Like> {
    try {
      const like = await databases.createDocument(
        this.db,
        COLLECTIONS.LIKES,
        ID.unique(),
        { userId, targetId, targetType }
      );

      const targetCollection = targetType === 'post' ? COLLECTIONS.POSTS : COLLECTIONS.RESOURCES; // Add more types as needed
      const doc = await databases.getDocument(this.db, targetCollection, targetId);
      await databases.updateDocument(this.db, targetCollection, targetId, {
          likesCount: (doc.likesCount || 0) + 1
      });

      return like as Like;
    } catch (error) {
      console.error(`Error liking ${targetType}:`, error);
      throw error;
    }
  }

  async unlike(likeId: string, targetId: string, targetType: Like['targetType']): Promise<void> {
    try {
      await databases.deleteDocument(this.db, COLLECTIONS.LIKES, likeId);
      const targetCollection = targetType === 'post' ? COLLECTIONS.POSTS : COLLECTIONS.RESOURCES;
      const doc = await databases.getDocument(this.db, targetCollection, targetId);
      await databases.updateDocument(this.db, targetCollection, targetId, {
          likesCount: Math.max(0, (doc.likesCount || 0) - 1)
      });
    } catch (error) {
      console.error("Error unliking:", error);
      throw error;
    }
  }

  async getLike(userId: string, targetId: string): Promise<Like | null> {
      const response = await databases.listDocuments(this.db, COLLECTIONS.LIKES, [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
      ]);
      return response.documents[0] as Like || null;
  }

  async bookmark(userId: string, targetId: string, targetType: Bookmark['targetType']): Promise<Bookmark> {
    try {
      const bookmark = await databases.createDocument(
        this.db,
        COLLECTIONS.BOOKMARKS,
        ID.unique(),
        { userId, targetId, targetType }
      );
      const targetCollection = targetType === 'post' ? COLLECTIONS.POSTS : COLLECTIONS.RESOURCES;
      const doc = await databases.getDocument(this.db, targetCollection, targetId);
      await databases.updateDocument(this.db, targetCollection, targetId, {
          bookmarksCount: (doc.bookmarksCount || 0) + 1
      });
      return bookmark as Bookmark;
    } catch (error) {
      console.error(`Error bookmarking ${targetType}:`, error);
      throw error;
    }
  }

  async unbookmark(bookmarkId: string, targetId: string, targetType: Bookmark['targetType']): Promise<void> {
    try {
      await databases.deleteDocument(this.db, COLLECTIONS.BOOKMARKS, bookmarkId);
      const targetCollection = targetType === 'post' ? COLLECTIONS.POSTS : COLLECTIONS.RESOURCES;
      const doc = await databases.getDocument(this.db, targetCollection, targetId);
      await databases.updateDocument(this.db, targetCollection, targetId, {
          bookmarksCount: Math.max(0, (doc.bookmarksCount || 0) - 1)
      });
    } catch (error) {
      console.error("Error unbookmarking:", error);
      throw error;
    }
  }

  async getBookmark(userId: string, targetId: string): Promise<Bookmark | null> {
      const response = await databases.listDocuments(this.db, COLLECTIONS.BOOKMARKS, [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
      ]);
      return response.documents[0] as Bookmark || null;
  }
}

export const interactionsService = new InteractionsService();
