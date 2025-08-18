const { Client, Databases, Users } = require('node-appwrite');

/*
  This Appwrite Function is triggered on a schedule (e.g., using a CRON job).
  It can be used to perform periodic analytics, data roll-ups, or cleanup tasks.

  Example tasks:
  - Calculate daily active users.
  - Update trending scores for posts.
  - Clean up old, inactive data.

  Required Environment Variables:
  - APPWRITE_API_KEY: An Appwrite API key with required permissions.
  - APPWRITE_ENDPOINT: Your Appwrite endpoint.
  - APPWRITE_PROJECT_ID: Your Appwrite project ID.
  - APPWRITE_DATABASE_ID: The ID of your database.

  Trigger:
  - CRON Schedule (e.g., '0 0 * * *' for once a day at midnight).
*/

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const users = new Users(client);

  try {
    console.log("Starting daily analytics job...");

    // Example 1: Calculate Daily Active Users (DAU)
    // This is a simplified example. A real implementation might check a 'lastActive' timestamp.
    const recentUsers = await users.list([
        // Example: Query for users active in the last 24 hours
        // This requires an index on the lastActive attribute.
        // Query.greaterThan('lastActive', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);
    const dau = recentUsers.total;
    console.log(`Daily Active Users: ${dau}`);

    // Example 2: Update trending scores for posts
    // This is a simplified example. A real algorithm would be more complex.
    const posts = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.POSTS_COLLECTION_ID,
        [] // Get all posts (you would paginate in a real scenario)
    );

    for (const post of posts.documents) {
        const likes = post.likesCount || 0;
        const comments = post.commentsCount || 0;
        const ageInHours = (new Date() - new Date(post.$createdAt)) / (1000 * 60 * 60);

        // Simple trending score formula
        const trendingScore = (likes + comments * 2) / Math.pow(ageInHours + 2, 1.8);

        await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.POSTS_COLLECTION_ID,
            post.$id,
            { trendingScore: trendingScore } // Assumes a 'trendingScore' float attribute exists
        );
    }
    console.log(`Updated trending scores for ${posts.documents.length} posts.`);

    console.log("Daily analytics job finished successfully.");
    res.json({ success: true, message: "Analytics job completed." });

  } catch (error) {
    console.error("Error running analytics job:", error);
    res.json({ success: false, error: error.message }, 500);
  }
};
