import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface Notification {
  $id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'pod_join' | 'message' | 'resource' | 'event';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
}

class NotificationsService {
  private databaseId = DATABASE_ID;
  private collectionId = COLLECTIONS.NOTIFICATIONS;

  async createNotification(notificationData: Omit<Notification, '$id' | 'timestamp' | 'isRead'>): Promise<Notification> {
    try {
      const notification = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          ...notificationData,
          isRead: false,
          timestamp: new Date().toISOString(),
        }
      );
      return notification as Notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      return response.documents as Notification[];
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        notificationId,
        {
          isRead: true,
        }
      );
      return notification as Notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
      const notifications = await this.getUserNotifications(userId, 100); // Get up to 100 unread
      const unread = notifications.filter(n => !n.isRead);

      const promises = unread.map(n => this.markAsRead(n.$id));

      await Promise.all(promises);
  }
}

export const notificationService = new NotificationsService();
