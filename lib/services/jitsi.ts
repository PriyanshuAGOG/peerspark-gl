// Jitsi Service for creating video call links

class JitsiService {
  private jitsiDomain = "meet.jit.si";

  /**
   * Creates a Jitsi meeting URL for a given room.
   * @param roomId The unique ID of the chat room to be used for the meeting link.
   * @returns The full URL for the Jitsi meeting.
   */
  public createMeetingUrl(roomId: string): string {
    if (!roomId) {
      throw new Error("A room ID is required to create a meeting URL.");
    }
    // Sanitize room ID to be URL-friendly, although Jitsi is quite flexible.
    const meetingId = `PeerSpark-${roomId.replace(/[^a-zA-Z0-9-_]/g, '')}`;
    return `https://${this.jitsiDomain}/${meetingId}`;
  }

  /**
   * A wrapper function to match the call in the chat page.
   * In a real app, this might have more logic, e.g., notifying participants.
   */
  public async createDirectCall(roomId: string, initiatorId: string, participants: string[]): Promise<string> {
    // For now, this is a simple wrapper around createMeetingUrl.
    // In the future, it could create a notification or calendar event for participants.
    return this.createMeetingUrl(roomId);
  }
}

export const jitsiService = new JitsiService();
