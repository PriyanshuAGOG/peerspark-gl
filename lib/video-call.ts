// Jitsi Meet Integration Service

import { calendarService } from './services/calendar';
import { notificationService } from './services/notifications';
import { podsService } from './services/pods';
import { authService } from './auth';

interface JitsiMeetingOptions {
  roomName: string;
  width?: string;
  height?: string;
  parentNode?: HTMLElement;
  configOverwrite?: object;
  interfaceConfigOverwrite?: object;
  userInfo?: {
    displayName: string;
    email?: string;
  };
}

class JitsiService {
  private domain = "meet.jit.si";

  generateMeetingUrl(roomName: string): string {
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, "");
    return `https://${this.domain}/${cleanRoomName}`;
  }

  getMeetingOptions(options: Partial<JitsiMeetingOptions>): JitsiMeetingOptions {
    const roomName = options.roomName || `PeerSpark-Session-${Date.now()}`;
    return {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: undefined,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        prejoinPageEnabled: false,
        ...options.configOverwrite,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
        ],
        ...options.interfaceConfigOverwrite,
      },
      userInfo: {
        displayName: 'Guest',
        ...options.userInfo,
      },
    };
  }

  async createPodMeeting(podId: string, userId: string, title: string): Promise<string> {
    try {
      const pod = await podsService.getPod(podId);
      const user = await authService.getUserProfile(userId);

      if (!pod || !user) {
        throw new Error("Pod or user not found");
      }

      const roomName = `PeerSpark-Pod-${podId}-${Date.now()}`;
      const meetingUrl = this.generateMeetingUrl(roomName);

      // Create a calendar event for the meeting
      await calendarService.createEvent({
        userId,
        title: `${title} - ${pod.name}`,
        description: `Video meeting for ${pod.name} pod`,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        type: "meeting",
        podId: podId,
        meetingUrl: meetingUrl,
        attendees: pod.members,
      });

      // Notify pod members
      const notificationPromises = pod.members
        .filter((memberId) => memberId !== userId)
        .map((memberId) =>
          notificationService.createNotification({
            userId: memberId,
            title: "Meeting Started",
            message: `${user.displayName} started a meeting in ${pod.name}`,
            type: "event",
            actionUrl: meetingUrl,
            actionText: "Join Meeting",
          })
        );

      await Promise.all(notificationPromises);

      return meetingUrl;
    } catch (error) {
      console.error("Error creating pod meeting:", error);
      throw error;
    }
  }

  async createDirectCall(chatRoomId: string, initiatorId: string, participants: string[]): Promise<string> {
    try {
      const initiator = await authService.getUserProfile(initiatorId);
      if (!initiator) throw new Error("Initiator not found");

      const roomName = `PeerSpark-Call-${chatRoomId}-${Date.now()}`;
      const meetingUrl = this.generateMeetingUrl(roomName);

      const notificationPromises = participants
        .filter((p) => p !== initiatorId)
        .map((participantId) =>
          notificationService.createNotification({
            userId: participantId,
            title: "Incoming Call",
            message: `${initiator.displayName} is calling you.`,
            type: "event", // or a new 'call' type
            actionUrl: meetingUrl,
            actionText: "Join Call",
          })
        );

      await Promise.all(notificationPromises);

      return meetingUrl;
    } catch (error) {
      console.error("Error creating direct call:", error);
      throw error;
    }
  }
}

export const jitsiService = new JitsiService();
