import { databases, teams } from '../appwrite'
import { ID, Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'
import { notificationService } from './notifications'

export interface Pod {
  $id: string;
  teamId: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  subject: string;
  difficulty: string;
  tags: string[];
  isActive: boolean;
  isPublic: boolean;
  maxMembers: number;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
  totalSessions: number;
  totalResources: number;
  avatar?: string;
  rules?: string[];
  schedule?: object;
}

class PodsService {
  private databaseId = DATABASE_ID
  private collectionId = COLLECTIONS.PODS

  // Create new pod
  async createPod(
    name: string,
    description: string,
    userId: string,
    metadata: Partial<Pod> = {}
  ): Promise<{ team: Models.Team; pod: Pod }> {
    try {
      // Create team in Appwrite Teams
      const team = await teams.create(ID.unique(), name, [userId]);

      // Store pod metadata in database
      const podData = {
        teamId: team.$id,
        name,
        description,
        creatorId: userId,
        members: [userId],
        subject: metadata.subject || "",
        difficulty: metadata.difficulty || "Beginner",
        tags: metadata.tags || [],
        isActive: true,
        isPublic: metadata.isPublic !== false,
        maxMembers: metadata.maxMembers || 50,
        memberCount: 1,
        totalSessions: 0,
        totalResources: 0,
        ...metadata,
      };

      const pod = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        team.$id,
        podData
      );

      // TODO: Create default chat room for the pod

      return { team, pod: pod as Pod };
    } catch (error) {
      console.error("Create pod error:", error);
      throw error;
    }
  }

  // Join pod
  async joinPod(podId: string, userId: string): Promise<boolean> {
    try {
      const teamId = podId; // Assuming pod document ID is the team ID
      // Add user to team
      // The 'roles' parameter is optional, and email is not needed if userId is provided.
      await teams.createMembership(teamId, ['member'], `${window.location.origin}/pod-invite?podId=${podId}&status=success`, userId);

      // Update pod member count and list
      const pod = await this.getPod(podId);
      if (!pod) throw new Error("Pod not found");

      const updatedMembers = [...new Set([...pod.members, userId])];

      await databases.updateDocument(this.databaseId, this.collectionId, podId, {
        memberCount: updatedMembers.length,
        members: updatedMembers,
      });

      // Create notification for pod creator
      await notificationService.createNotification(
        pod.creatorId,
        "New Member Joined",
        `Someone joined your pod "${pod.name}"`,
        "pod_join",
        { podId, userId }
      );

      return true;
    } catch (error) {
      console.error("Join pod error:", error);
      throw error;
    }
  }

  // Leave pod
  async leavePod(podId: string, userId: string): Promise<boolean> {
    try {
      const teamId = podId;
      const memberships = await teams.listMemberships(teamId);
      const membership = memberships.memberships.find((m) => m.userId === userId);

      if (membership) {
        await teams.deleteMembership(teamId, membership.$id);
      }

      const pod = await this.getPod(podId);
      if (!pod) throw new Error("Pod not found");

      const updatedMembers = pod.members.filter((id: string) => id !== userId);

      await databases.updateDocument(this.databaseId, this.collectionId, podId, {
        memberCount: Math.max(0, updatedMembers.length),
        members: updatedMembers,
      });

      return true;
    } catch (error) {
      console.error("Leave pod error:", error);
      throw error;
    }
  }

  // Get a single pod by its ID
  async getPod(podId: string): Promise<Pod | null> {
    try {
      const pod = await databases.getDocument(this.databaseId, this.collectionId, podId);
      return pod as Pod;
    } catch (error) {
      console.error(`Error fetching pod ${podId}:`, error);
      return null;
    }
  }

  // Get all public pods
  async getPublicPods(limit = 20, offset = 0): Promise<Pod[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
            Query.equal('isPublic', true),
            Query.equal('isActive', true),
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as Pod[];
    } catch (error) {
      console.error("Error fetching public pods:", error);
      return [];
    }
  }

  // Get pods a user is a member of
  async getUserPods(userId: string): Promise<Pod[]> {
    try {
        const response = await databases.listDocuments(
            this.databaseId,
            this.collectionId,
            [
                Query.search('members', userId)
            ]
        );
        return response.documents as Pod[];
    } catch (error) {
        console.error("Error fetching user's pods:", error);
        return [];
    }
  }
}

export const podsService = new PodsService();
