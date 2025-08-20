import { databases } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface Resource {
  $id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  title: string;
  description?: string;
  tags: string[];
  authorId: string;
  podId?: string;
  visibility: 'public' | 'pod' | 'private';
  category: string;
  uploadedAt: string;
  downloads: number;
  likes: number;
  views: number;
  isApproved: boolean;
}

class ResourcesService {
  private databaseId = DATABASE_ID;
  private collectionId = COLLECTIONS.RESOURCES;

  async createResource(resourceData: Omit<Resource, '$id' | 'uploadedAt' | 'downloads' | 'likes' | 'views' | 'isApproved'>): Promise<Resource> {
    try {
      const resource = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          ...resourceData,
          tags: resourceData.tags || [],
          downloads: 0,
          likes: 0,
          views: 0,
          isApproved: true, // Auto-approve for now
        }
      );
      return resource as Resource;
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  }

  async getResources(query: string[] = [], limit: number = 25, offset: number = 0): Promise<Resource[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [...query, Query.limit(limit), Query.offset(offset), Query.orderDesc('uploadedAt')]
      );
      return response.documents as Resource[];
    } catch (error) {
      console.error("Error fetching resources:", error);
      return [];
    }
  }

  async getResource(documentId: string): Promise<Resource | null> {
    try {
        const resource = await databases.getDocument(this.databaseId, this.collectionId, documentId);
        return resource as Resource;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
  }

  async updateResource(documentId: string, updates: Partial<Resource>): Promise<Resource> {
      try {
          const resource = await databases.updateDocument(this.databaseId, this.collectionId, documentId, updates);
          return resource as Resource;
      } catch (error) {
          console.error("Error updating resource:", error);
          throw error;
      }
  }

  async deleteResource(documentId: string): Promise<void> {
      try {
          await databases.deleteDocument(this.databaseId, this.collectionId, documentId);
      } catch (error) {
          console.error("Error deleting resource:", error);
          throw error;
      }
  }
}

export const resourcesService = new ResourcesService();
