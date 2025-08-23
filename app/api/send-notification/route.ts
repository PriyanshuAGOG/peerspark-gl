import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Only configure web-push if VAPID keys are set
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@peerspark.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request: NextRequest) {
  // If keys are not configured, return an error immediately.
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('VAPID keys are not configured. Cannot send push notifications.');
    return NextResponse.json(
      { error: 'Push notifications are not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const { userId, title, body, data } = await request.json()

    // Get user's push subscriptions
    const subscriptions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      'push-subscriptions-collection',
      [
        Query.equal('userId', userId)
      ]
    )

    const payload = JSON.stringify({
      title,
      body,
      data: {
        url: data?.url || '/app/notifications',
        ...data
      },
      tag: data?.tag || 'notification'
    })

    // Send notification to all user's devices
    const promises = subscriptions.documents.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        await webpush.sendNotification(pushSubscription, payload)
      } catch (error: any) {
        console.error('Error sending to subscription:', error)

        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          await databases.deleteDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'push-subscriptions-collection',
            sub.$id
          )
        }
      }
    })

    await Promise.allSettled(promises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
