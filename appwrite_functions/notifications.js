const { Client, Messaging, Databases } = require('node-appwrite');

/*
  This Appwrite Function is triggered when a new document is created in the 'notifications' collection.
  It sends a push notification to the user who the notification is for.

  Required Environment Variables:
  - APPWRITE_API_KEY: An Appwrite API key with permissions to read users and send messages.
  - APPWRITE_ENDPOINT: Your Appwrite endpoint.
  - APPWRITE_PROJECT_ID: Your Appwrite project ID.
  - APPWRITE_DATABASE_ID: The ID of your database.
  - PUSH_SUBSCRIPTIONS_COLLECTION_ID: The ID of the collection storing push subscriptions.

  Trigger:
  - databases.*.collections.YOUR_NOTIFICATIONS_COLLECTION_ID.documents.create
*/

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const messaging = new Messaging(client);
  const databases = new Databases(client);

  try {
    const notification = JSON.parse(req.payload);
    const userId = notification.userId;

    // Fetch the user's push notification subscriptions
    const subscriptions = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        [`equal("userId", "${userId}")`]
    );

    if (subscriptions.documents.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return res.json({ success: true, message: "No subscriptions found." });
    }

    const apyKey = process.env.VAPID_PRIVATE_KEY;

    for (const sub of subscriptions.documents) {
        await messaging.createPush(
            'push-notification-topic', // A generic topic name
            {
                title: notification.title,
                body: notification.message,
                data: {
                    url: notification.actionUrl || '/app/notifications',
                },
                icon: notification.imageUrl || 'https://peerspark.com/icon.png'
            },
            [sub.target], // The device token from the subscription document
            apyKey
        );
    }

    console.log(`Push notification sent successfully to user ${userId}`);
    res.json({ success: true, message: "Push notification sent." });

  } catch (error) {
    console.error("Error sending push notification:", error);
    res.json({ success: false, error: error.message }, 500);
  }
};
