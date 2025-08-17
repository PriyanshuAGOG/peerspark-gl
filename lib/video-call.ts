// Video Call Integration using WebRTC and Socket.IO
import { io, type Socket } from "socket.io-client"

interface VideoCallConfig {
  roomId: string
  userId: string
  userName: string
}

interface Participant {
  id: string
  name: string
  isVideoOn: boolean
  isAudioOn: boolean
  stream?: MediaStream
}

class VideoCallService {
  private socket: Socket | null = null
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private participants: Map<string, Participant> = new Map()
  private config: VideoCallConfig | null = null
  private iceServers = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]

  async initialize(config: VideoCallConfig) {
    this.config = config

    // Connect to Socket.IO server
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001", {
      transports: ["websocket"],
    })

    this.setupSocketListeners()

    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on("user-joined", (participant: Participant) => {
      this.participants.set(participant.id, participant)
      this.createPeerConnection(participant.id)
    })

    this.socket.on("user-left", (userId: string) => {
      this.participants.delete(userId)
      const peerConnection = this.peerConnections.get(userId)
      if (peerConnection) {
        peerConnection.close()
        this.peerConnections.delete(userId)
      }
    })

    this.socket.on("offer", async ({ from, offer }) => {
      const peerConnection = this.createPeerConnection(from)
      await peerConnection.setRemoteDescription(offer)

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      this.socket?.emit("answer", { to: from, answer })
    })

    this.socket.on("answer", async ({ from, answer }) => {
      const peerConnection = this.peerConnections.get(from)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
      }
    })

    this.socket.on("ice-candidate", async ({ from, candidate }) => {
      const peerConnection = this.peerConnections.get(from)
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate)
      }
    })

    this.socket.on("media-state-changed", ({ userId, isVideoOn, isAudioOn }) => {
      const participant = this.participants.get(userId)
      if (participant) {
        participant.isVideoOn = isVideoOn
        participant.isAudioOn = isAudioOn
        this.participants.set(userId, participant)
      }
    })
  }

  private createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({ iceServers: this.iceServers })

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const participant = this.participants.get(userId)
      if (participant) {
        participant.stream = event.streams[0]
        this.participants.set(userId, participant)
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit("ice-candidate", {
          to: userId,
          candidate: event.candidate,
        })
      }
    }

    this.peerConnections.set(userId, peerConnection)
    return peerConnection
  }

  async joinRoom() {
    if (!this.socket || !this.config) return

    this.socket.emit("join-room", {
      roomId: this.config.roomId,
      userId: this.config.userId,
      userName: this.config.userName,
    })
  }

  async leaveRoom() {
    if (!this.socket || !this.config) return

    this.socket.emit("leave-room", {
      roomId: this.config.roomId,
      userId: this.config.userId,
    })

    // Close all peer connections
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Disconnect socket
    this.socket.disconnect()
    this.socket = null
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled

      // Notify other participants
      this.socket?.emit("media-state-changed", {
        roomId: this.config?.roomId,
        isVideoOn: videoTrack.enabled,
        isAudioOn: this.localStream.getAudioTracks()[0]?.enabled || false,
      })

      return videoTrack.enabled
    }
    return false
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled

      // Notify other participants
      this.socket?.emit("media-state-changed", {
        roomId: this.config?.roomId,
        isVideoOn: this.localStream.getVideoTracks()[0]?.enabled || false,
        isAudioOn: audioTrack.enabled,
      })

      return audioTrack.enabled
    }
    return false
  }

  async shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0]
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      })

      return screenStream
    } catch (error) {
      console.error("Error starting screen share:", error)
      throw error
    }
  }

  async stopScreenShare() {
    if (!this.localStream) return

    const videoTrack = this.localStream.getVideoTracks()[0]

    // Replace screen share track with camera track
    this.peerConnections.forEach(async (pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video")
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack)
      }
    })
  }

  getParticipants(): Participant[] {
    return Array.from(this.participants.values())
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }
}

// Utility function to create video call service
export function createVideoCall(config: VideoCallConfig) {
  return new VideoCallService(config)
}

export type { VideoCallConfig, Participant }
