import { databases } from './appwrite'
import { ID, Query } from 'appwrite'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export class PushNotificationService {
  private vapidPublicKey: string

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Subscribe to push notifications
  async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported')
      }

      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied')
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      // Save subscription to database
      await this.saveSubscription(userId, pushSubscription)

      return pushSubscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }

  // Save subscription to database
  private async saveSubscription(userId: string, subscription: PushSubscription) {
    try {
      // Check if subscription already exists
      const existing = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'push-subscriptions-collection',
        [
          Query.equal('userId', userId),
          Query.equal('endpoint', subscription.endpoint)
        ]
      )

      if (existing.documents.length === 0) {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'push-subscriptions-collection',
          ID.unique(),
          {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            createdAt: new Date().toISOString()
          }
        )
      }
    } catch (error) {
      console.error('Error saving push subscription:', error)
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(userId: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()

          // Remove from database
          await this.removeSubscription(userId, subscription.endpoint)
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }

  // Remove subscription from database
  private async removeSubscription(userId: string, endpoint: string) {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'push-subscriptions-collection',
        [
          Query.equal('userId', userId),
          Query.equal('endpoint', endpoint)
        ]
      )

      for (const doc of response.documents) {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'push-subscriptions-collection',
          doc.$id
        )
      }
    } catch (error) {
      console.error('Error removing push subscription:', error)
    }
  }

  // Send notification (called from server)
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          title,
          body,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export const pushNotificationService = new PushNotificationService()
