import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface CalendarEvent {
  $id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: 'study' | 'meeting' | 'deadline' | 'exam';
  podId?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  attendees?: string[];
  location?: string;
  meetingUrl?: string;
  reminders?: number[];
  createdAt: string;
  updatedAt?: string;
  isCompleted?: boolean;
}

class CalendarService {
  private databaseId = DATABASE_ID;
  private collectionId = COLLECTIONS.EVENTS;

  async createEvent(eventData: Omit<CalendarEvent, '$id' | 'createdAt'>): Promise<CalendarEvent> {
    try {
      const event = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        eventData
      );
      return event as CalendarEvent;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  async getUserEvents(userId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('startTime', startDate),
          Query.lessThanEqual('startTime', endDate),
          Query.orderAsc('startTime')
        ]
      );
      return response.documents as CalendarEvent[];
    } catch (error) {
      console.error("Error fetching user events:", error);
      return [];
    }
  }

  async updateEvent(documentId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
      try {
          const event = await databases.updateDocument(this.databaseId, this.collectionId, documentId, {
              ...updates,
              updatedAt: new Date().toISOString()
          });
          return event as CalendarEvent;
      } catch (error) {
          console.error("Error updating event:", error);
          throw error;
      }
  }

  async deleteEvent(documentId: string): Promise<void> {
      try {
          await databases.deleteDocument(this.databaseId, this.collectionId, documentId);
      } catch (error) {
          console.error("Error deleting event:", error);
          throw error;
      }
  }
}

export const calendarService = new CalendarService();
