import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'
import { usersService } from './users'

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

export interface Follow {
    $id: string;
    followerId: string; // The user who is following
    followingId: string; // The user who is being followed
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

  // Note: Ensure a 'FOLLOWS' collection exists with string attributes: 'followerId', 'followingId'
  async follow(followerId: string, followingId: string): Promise<Follow> {
      try {
          const followDoc = await databases.createDocument(
              this.db,
              COLLECTIONS.FOLLOWS,
              ID.unique(),
              { followerId, followingId }
          );

          // Update counts on user profiles
          const followerProfile = await usersService.getProfile(followerId);
          const followingProfile = await usersService.getProfile(followingId);

          if (followerProfile) {
              await usersService.updateProfile(followerProfile.$id, { followingCount: (followerProfile.followingCount || 0) + 1 });
          }
          if (followingProfile) {
              await usersService.updateProfile(followingProfile.$id, { followersCount: (followingProfile.followersCount || 0) + 1 });
          }

          return followDoc as Follow;
      } catch (error) {
          console.error("Error following user:", error);
          throw error;
      }
  }

  async unfollow(followId: string, followerId: string, followingId: string): Promise<void> {
      try {
          await databases.deleteDocument(this.db, COLLECTIONS.FOLLOWS, followId);

          // Update counts on user profiles
          const followerProfile = await usersService.getProfile(followerId);
          const followingProfile = await usersService.getProfile(followingId);

          if (followerProfile) {
              await usersService.updateProfile(followerProfile.$id, { followingCount: Math.max(0, (followerProfile.followingCount || 0) - 1) });
          }
          if (followingProfile) {
              await usersService.updateProfile(followingProfile.$id, { followersCount: Math.max(0, (followingProfile.followersCount || 0) - 1) });
          }
      } catch (error) {
          console.error("Error unfollowing user:", error);
          throw error;
      }
  }

  async isFollowing(followerId: string, followingId: string): Promise<{ isFollowing: boolean; followId: string | null }> {
      try {
          const response = await databases.listDocuments(this.db, COLLECTIONS.FOLLOWS, [
              Query.equal('followerId', followerId),
              Query.equal('followingId', followingId),
          ]);
          if (response.documents.length > 0) {
              return { isFollowing: true, followId: response.documents[0].$id };
          }
          return { isFollowing: false, followId: null };
      } catch (error) {
          console.error("Error checking follow status:", error);
          return { isFollowing: false, followId: null };
      }
  }

  async getFollowing(userId: string): Promise<string[]> {
      try {
          const response = await databases.listDocuments(this.db, COLLECTIONS.FOLLOWS, [
              Query.equal('followerId', userId),
              Query.limit(5000) // Appwrite max limit
          ]);
          return response.documents.map(doc => (doc as Follow).followingId);
      } catch (error) {
          console.error("Error getting following list:", error);
          return [];
      }
  }
}

export const interactionsService = new InteractionsService();
