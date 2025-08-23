import { databases } from '../appwrite'
import { ID } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface WaitlistEntry {
  $id: string;
  name: string;
  email: string;
  createdAt: string;
}

class WaitlistService {
  private db = DATABASE_ID;
  private collectionId = COLLECTIONS.WAITLIST;

  async joinWaitlist(name: string, email: string): Promise<WaitlistEntry> {
    try {
      const entry = await databases.createDocument(
        this.db,
        this.collectionId,
        ID.unique(),
        {
          name,
          email,
          createdAt: new Date().toISOString(),
        }
      );
      return entry as WaitlistEntry;
    } catch (error) {
      console.error("Error joining waitlist:", error);
      // Check for unique constraint error on email
      if (error.code === 409) {
          throw new Error("This email is already on the waitlist.");
      }
      throw new Error("Could not join the waitlist. Please try again.");
    }
  }
}

export const waitlistService = new WaitlistService();
