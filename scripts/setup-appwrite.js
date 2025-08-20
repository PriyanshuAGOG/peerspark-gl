require('dotenv').config();
const sdk = require('node-appwrite');

/*
  This script automates the setup of your Appwrite project schema.
  It's designed to be idempotent, meaning you can run it multiple times
  without causing errors or duplicating resources.
*/

// --- --- --- --- --- --- --- --- --- ---
// --- Schema Definition ---
// --- --- --- --- --- --- --- --- --- ---

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const DATABASE_NAME = 'PeerSpark Main Database';

const BUCKETS = [
    { id: 'avatars', name: 'User Avatars', allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'], fileSizeLimit: 5 * 1024 * 1024 },
    { id: 'resources', name: 'Study Resources', allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3'], fileSizeLimit: 50 * 1024 * 1024 },
    { id: 'attachments', name: 'Chat Attachments', allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mp3', 'zip'], fileSizeLimit: 25 * 1024 * 1024 },
    { id: 'post_images', name: 'Post Images', allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'], fileSizeLimit: 10 * 1024 * 1024 },
];

const COLLECTIONS = [
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        name: 'User Profiles',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'username', type: 'string', size: 255, required: true },
            { key: 'displayName', type: 'string', size: 255, required: true },
            { key: 'firstName', type: 'string', size: 255, required: true },
            { key: 'lastName', type: 'string', size: 255, required: true },
            { key: 'bio', type: 'string', size: 1000, required: false, default: '' },
            { key: 'avatar', type: 'string', size: 500, required: false, default: '' },
            { key: 'coverImage', type: 'string', size: 500, required: false, default: '' },
            { key: 'location', type: 'string', size: 255, required: false, default: '' },
            { key: 'website', type: 'string', size: 255, required: false, default: '' },
            { key: 'institution', type: 'string', size: 255, required: false, default: '' },
            { key: 'major', type: 'string', size: 255, required: false, default: '' },
            { key: 'graduationYear', type: 'string', size: 50, required: false, default: '' },
            { key: 'jobTitle', type: 'string', size: 255, required: false, default: '' },
            { key: 'company', type: 'string', size: 255, required: false, default: '' },
            { key: 'skills', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'interests', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'subjects', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'followersCount', type: 'integer', required: false, default: 0 },
            { key: 'followingCount', type: 'integer', required: false, default: 0 },
            { key: 'postsCount', type: 'integer', required: false, default: 0 },
            { key: 'reputationScore', type: 'integer', required: false, default: 0 },
            { key: 'isVerified', type: 'boolean', required: false, default: false },
            { key: 'isPrivate', type: 'boolean', required: false, default: false },
            { key: 'emailNotifications', type: 'boolean', required: false, default: true },
            { key: 'pushNotifications', type: 'boolean', required: false, default: true },
            { key: 'lastActive', type: 'string', size: 255, required: false, default: '' },
            { key: 'joinedAt', type: 'string', size: 255, required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'], order: 'ASC' },
            { key: 'username_idx', type: 'key', attributes: ['username'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID,
        name: 'Posts',
        attributes: [
            { key: 'authorId', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'podId', type: 'string', size: 255, required: false, default: '' },
            { key: 'resourceId', type: 'string', size: 255, required: false, default: '' },
            { key: 'imageUrl', type: 'string', size: 500, required: false, default: '' },
            { key: 'imageFileId', type: 'string', size: 255, required: false, default: '' },
            { key: 'timestamp', type: 'string', size: 255, required: true },
            { key: 'likes', type: 'integer', required: false, default: 0 },
            { key: 'comments', type: 'integer', required: false, default: 0 },
            { key: 'shares', type: 'integer', required: false, default: 0 },
            { key: 'isEdited', type: 'boolean', required: false, default: false },
            { key: 'editedAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'visibility', type: 'string', size: 50, required: false, default: 'public' },
            { key: 'tags', type: 'string', size: 1000, required: false, default: '[]' },
            { key: 'mentions', type: 'string', size: 1000, required: false, default: '[]' },
            { key: 'likedBy', type: 'string', size: 5000, required: false, default: '[]' },
        ],
        indexes: [
            { key: 'authorId_idx', type: 'key', attributes: ['authorId'], order: 'ASC' },
            { key: 'podId_idx', type: 'key', attributes: ['podId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
        name: 'Messages',
        attributes: [
            { key: 'roomId', type: 'string', size: 255, required: true },
            { key: 'authorId', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'timestamp', type: 'string', size: 255, required: true },
            { key: 'isEdited', type: 'boolean', required: false, default: false },
            { key: 'editedAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'replyTo', type: 'string', size: 255, required: false, default: '' },
            { key: 'fileUrl', type: 'string', size: 500, required: false, default: '' },
            { key: 'fileName', type: 'string', size: 255, required: false, default: '' },
            { key: 'fileSize', type: 'integer', required: false, default: 0 },
            { key: 'reactions', type: 'string', size: 2000, required: false, default: '{}' },
            { key: 'mentions', type: 'string', size: 1000, required: false, default: '[]' },
        ],
        indexes: [
            { key: 'roomId_idx', type: 'key', attributes: ['roomId'], order: 'ASC' },
            { key: 'authorId_idx', type: 'key', attributes: ['authorId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_PODS_COLLECTION_ID,
        name: 'Pods',
        attributes: [
            { key: 'teamId', type: 'string', size: 255, required: true },
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: true },
            { key: 'creatorId', type: 'string', size: 255, required: true },
            { key: 'members', type: 'string', size: 5000, required: true, default: '[]' },
            { key: 'subject', type: 'string', size: 100, required: false, default: '' },
            { key: 'difficulty', type: 'string', size: 50, required: false, default: 'Beginner' },
            { key: 'tags', type: 'string', size: 1000, required: false, default: '[]' },
            { key: 'isActive', type: 'boolean', required: false, default: true },
            { key: 'isPublic', type: 'boolean', required: false, default: true },
            { key: 'maxMembers', type: 'integer', required: false, default: 50 },
            { key: 'createdAt', type: 'string', size: 255, required: true },
            { key: 'updatedAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'memberCount', type: 'integer', required: false, default: 1 },
            { key: 'totalSessions', type: 'integer', required: false, default: 0 },
            { key: 'totalResources', type: 'integer', required: false, default: 0 },
            { key: 'avatar', type: 'string', size: 500, required: false, default: '' },
            { key: 'rules', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'schedule', type: 'string', size: 2000, required: false, default: '{}' },
        ],
        indexes: [
            { key: 'creatorId_idx', type: 'key', attributes: ['creatorId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_COLLECTION_ID,
        name: 'Resources',
        attributes: [
            { key: 'fileId', type: 'string', size: 255, required: true },
            { key: 'fileName', type: 'string', size: 255, required: true },
            { key: 'fileSize', type: 'integer', required: true },
            { key: 'fileType', type: 'string', size: 100, required: true },
            { key: 'fileUrl', type: 'string', size: 500, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: false, default: '' },
            { key: 'tags', type: 'string', size: 1000, required: false, default: '[]' },
            { key: 'authorId', type: 'string', size: 255, required: true },
            { key: 'podId', type: 'string', size: 255, required: false, default: '' },
            { key: 'visibility', type: 'string', size: 50, required: false, default: 'public' },
            { key: 'category', type: 'string', size: 100, required: false, default: 'other' },
            { key: 'uploadedAt', type: 'string', size: 255, required: true },
            { key: 'downloads', type: 'integer', required: false, default: 0 },
            { key: 'likes', type: 'integer', required: false, default: 0 },
            { key: 'views', type: 'integer', required: false, default: 0 },
            { key: 'isApproved', type: 'boolean', required: false, default: true },
        ],
        indexes: [
            { key: 'authorId_idx', type: 'key', attributes: ['authorId'], order: 'ASC' },
            { key: 'podId_idx', type: 'key', attributes: ['podId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
        name: 'Notifications',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'message', type: 'string', size: 1000, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'isRead', type: 'boolean', required: false, default: false },
            { key: 'timestamp', type: 'string', size: 255, required: true },
            { key: 'readAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'actionUrl', type: 'string', size: 500, required: false, default: '' },
            { key: 'actionText', type: 'string', size: 100, required: false, default: '' },
            { key: 'imageUrl', type: 'string', size: 500, required: false, default: '' },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID,
        name: 'Calendar Events',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: false, default: '' },
            { key: 'startTime', type: 'string', size: 255, required: true },
            { key: 'endTime', type: 'string', size: 255, required: true },
            { key: 'type', type: 'string', size: 50, required: false, default: 'study' },
            { key: 'podId', type: 'string', size: 255, required: false, default: '' },
            { key: 'isRecurring', type: 'boolean', required: false, default: false },
            { key: 'recurringPattern', type: 'string', size: 500, required: false, default: '' },
            { key: 'attendees', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'location', type: 'string', size: 255, required: false, default: '' },
            { key: 'meetingUrl', type: 'string', size: 500, required: false, default: '' },
            { key: 'reminders', type: 'string', size: 500, required: false, default: '[15]' },
            { key: 'createdAt', type: 'string', size: 255, required: true },
            { key: 'updatedAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'isCompleted', type: 'boolean', required: false, default: false },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'], order: 'ASC' },
            { key: 'podId_idx', type: 'key', attributes: ['podId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID,
        name: 'Chat Rooms',
        attributes: [
            { key: 'podId', type: 'string', size: 255, required: false, default: '' },
            { key: 'name', type: 'string', size: 255, required: false, default: '' },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'participants', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'createdBy', type: 'string', size: 255, required: false, default: '' },
            { key: 'createdAt', type: 'string', size: 255, required: true },
            { key: 'isActive', type: 'boolean', required: false, default: true },
            { key: 'lastMessage', type: 'string', size: 1000, required: false, default: '' },
            { key: 'lastMessageTime', type: 'string', size: 255, required: false, default: '' },
        ],
        indexes: []
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_FOLLOWS_COLLECTION_ID,
        name: 'Follows',
        attributes: [
            { key: 'followerId', type: 'string', size: 255, required: true },
            { key: 'followingId', type: 'string', size: 255, required: true },
        ],
        indexes: [
            { key: 'follower_following_idx', type: 'key', attributes: ['followerId', 'followingId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID,
        name: 'Likes',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'targetId', type: 'string', size: 255, required: true },
            { key: 'targetType', type: 'string', size: 50, required: true },
        ],
        indexes: [
            { key: 'user_target_idx', type: 'key', attributes: ['userId', 'targetId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID,
        name: 'Bookmarks',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'targetId', type: 'string', size: 255, required: true },
            { key: 'targetType', type: 'string', size: 50, required: true },
        ],
        indexes: [
            { key: 'user_target_idx', type: 'key', attributes: ['userId', 'targetId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_QUESTS_COLLECTION_ID,
        name: 'Quests',
        attributes: [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'difficulty', type: 'string', size: 50, required: true },
            { key: 'points', type: 'integer', required: true },
            { key: 'podId', type: 'string', size: 255, required: false },
            { key: 'content', type: 'string', size: 10000, required: false },
            { key: 'questions', type: 'string', size: 10000, required: false },
            { key: 'starterCode', type: 'string', size: 10000, required: false },
            { key: 'testCases', type: 'string', size: 10000, required: false },
            { key: 'hints', type: 'string', size: 2000, required: false, default: '[]' },
            { key: 'timeLimit', type: 'integer', required: false },
            { key: 'isActive', type: 'boolean', required: true },
        ],
        indexes: [
             { key: 'podId_idx', type: 'key', attributes: ['podId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_QUEST_PROGRESS_COLLECTION_ID,
        name: 'Quest Progress',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'questId', type: 'string', size: 255, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'score', type: 'integer', required: false },
            { key: 'answers', type: 'string', size: 10000, required: false },
            { key: 'codeSubmission', type: 'string', size: 10000, required: false },
            { key: 'startedAt', type: 'string', size: 255, required: true },
            { key: 'completedAt', type: 'string', size: 255, required: false },
        ],
        indexes: [
             { key: 'user_quest_idx', type: 'key', attributes: ['userId', 'questId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_ACHIEVEMENTS_COLLECTION_ID,
        name: 'Achievements',
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000, required: true },
            { key: 'icon', type: 'string', size: 255, required: true },
            { key: 'criteria', type: 'string', size: 2000, required: true },
        ],
        indexes: []
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_USER_ACHIEVEMENTS_COLLECTION_ID,
        name: 'User Achievements',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'achievementId', type: 'string', size: 255, required: true },
            { key: 'earnedAt', type: 'string', size: 255, required: true },
        ],
        indexes: [
            { key: 'user_achievement_idx', type: 'key', attributes: ['userId', 'achievementId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
        name: 'Comments',
        attributes: [
            { key: 'postId', type: 'string', size: 255, required: true },
            { key: 'authorId', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 2000, required: true },
            { key: 'timestamp', type: 'string', size: 255, required: true },
            { key: 'isEdited', type: 'boolean', required: false, default: false },
            { key: 'editedAt', type: 'string', size: 255, required: false, default: '' },
            { key: 'likesCount', type: 'integer', required: false, default: 0 },
        ],
        indexes: [
            { key: 'post_idx', type: 'key', attributes: ['postId'], order: 'ASC' },
        ]
    },
    {
        id: process.env.NEXT_PUBLIC_APPWRITE_PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        name: 'Push Subscriptions',
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'target', type: 'string', size: 10000, required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'], order: 'ASC' },
        ]
    }
];

// --- --- --- --- --- --- --- --- --- ---
// --- Appwrite Client Setup ---
// --- --- --- --- --- --- --- --- --- ---

const client = new sdk.Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

// --- --- --- --- --- --- --- --- --- ---
// --- Helper Functions ---
// --- --- --- --- --- --- --- --- --- ---

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createDatabaseIfNotExists() {
    console.log("Checking for database...");
    try {
        await databases.get(DATABASE_ID);
        console.log(`Database "${DATABASE_NAME}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Database not found. Creating "${DATABASE_NAME}"...`);
            await databases.create(DATABASE_ID, DATABASE_NAME);
            console.log("Database created successfully.");
        } else {
            throw error;
        }
    }
}

async function createBucketIfNotExists(bucket) {
    console.log(`\nChecking for bucket "${bucket.name}"...`);
    try {
        await storage.getBucket(bucket.id);
        console.log(`Bucket "${bucket.name}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Bucket not found. Creating "${bucket.name}"...`);
            await storage.createBucket(
                bucket.id,
                bucket.name,
                [
                    sdk.Permission.create(sdk.Role.users()), // Users can create
                    sdk.Permission.read(sdk.Role.any()),     // Anyone can read
                    sdk.Permission.update(sdk.Role.users()), // Users can update their own
                    sdk.Permission.delete(sdk.Role.users()), // Users can delete their own
                ],
                false, // fileSecurity
                true,  // enabled
                bucket.fileSizeLimit,
                bucket.allowedFileExtensions
            );
            console.log(`Bucket "${bucket.name}" created successfully.`);
        } else {
            throw error;
        }
    }
}

async function createCollectionIfNotExists(collection) {
    console.log(`\nChecking for collection "${collection.name}"...`);
    try {
        await databases.getCollection(DATABASE_ID, collection.id);
        console.log(`Collection "${collection.name}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Collection not found. Creating "${collection.name}"...`);
            await databases.createCollection(
                DATABASE_ID,
                collection.id,
                collection.name,
                [
                    sdk.Permission.create(sdk.Role.users()),
                    sdk.Permission.read(sdk.Role.any()),
                    sdk.Permission.update(sdk.Role.users()),
                    sdk.Permission.delete(sdk.Role.users()),
                ]
            );
            console.log(`Collection "${collection.name}" created successfully.`);
            // Appwrite needs a moment before we can add attributes
            await wait(1000);
        } else {
            throw error;
        }
    }
}

async function createAttributeIfNotExists(collectionId, attribute) {
    try {
        await databases.getAttribute(DATABASE_ID, collectionId, attribute.key);
        // console.log(`  - Attribute "${attribute.key}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`  - Creating attribute "${attribute.key}"...`);
            switch (attribute.type) {
                case 'string':
                    await databases.createStringAttribute(DATABASE_ID, collectionId, attribute.key, attribute.size, attribute.required, attribute.default);
                    break;
                case 'integer':
                    await databases.createIntegerAttribute(DATABASE_ID, collectionId, attribute.key, attribute.required, undefined, undefined, attribute.default);
                    break;
                case 'boolean':
                    await databases.createBooleanAttribute(DATABASE_ID, collectionId, attribute.key, attribute.required, attribute.default);
                    break;
                // Add other types as needed (float, datetime, etc.)
                default:
                    console.warn(`  - Unknown attribute type: ${attribute.type}`);
            }
            // Wait a moment for the attribute to be created before creating the next one
            await wait(500);
        } else {
            // Rethrow other errors
            throw error;
        }
    }
}

async function createIndexIfNotExists(collectionId, index) {
    try {
        await databases.getIndex(DATABASE_ID, collectionId, index.key);
        // console.log(`  - Index "${index.key}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`  - Creating index "${index.key}"...`);
            await databases.createIndex(DATABASE_ID, collectionId, index.key, index.type, index.attributes, [index.order]);
            await wait(500);
        } else {
            throw error;
        }
    }
}


// --- --- --- --- --- --- --- --- --- ---
// --- Main Execution ---
// --- --- --- --- --- --- --- --- --- ---

async function main() {
    console.log("Starting Appwrite schema setup...");
    try {
        await createDatabaseIfNotExists();

        for (const bucket of BUCKETS) {
            await createBucketIfNotExists(bucket);
        }

        for (const collection of COLLECTIONS) {
            if (!collection.id) {
                console.warn(`\nSkipping collection with no ID defined in .env: ${collection.name}`);
                continue;
            }
            await createCollectionIfNotExists(collection);
            console.log(`  Processing attributes for "${collection.name}"...`);
            for (const attr of collection.attributes) {
                await createAttributeIfNotExists(collection.id, attr);
            }
            if(collection.indexes && collection.indexes.length > 0) {
                console.log(`  Processing indexes for "${collection.name}"...`);
                for (const idx of collection.indexes) {
                    await createIndexIfNotExists(collection.id, idx);
                }
            }
        }

        console.log("\n✅ Appwrite schema setup completed successfully!");

    } catch (error) {
        console.error("\n❌ An error occurred during setup:", error);
        process.exit(1);
    }
}

main();
