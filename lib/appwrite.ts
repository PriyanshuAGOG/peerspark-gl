import { Client, Account, Databases, Storage, Teams, Avatars, Functions, Messaging } from "appwrite"

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

// Initialize Appwrite services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const teams = new Teams(client)
export const avatars = new Avatars(client)
export const functions = new Functions(client)
export const messaging = new Messaging(client)

// Environment variables
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const STORAGE_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!

// Collection IDs
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  POSTS: process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!,
  PODS: process.env.NEXT_PUBLIC_APPWRITE_PODS_COLLECTION_ID!,
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
  RESOURCES: process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_COLLECTION_ID!,
  EVENTS: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
  NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
  FOLLOWS: process.env.NEXT_PUBLIC_APPWRITE_FOLLOWS_COLLECTION_ID!,
  LIKES: process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
  COMMENTS: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
  BOOKMARKS: process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID!,
  CHAT_ROOMS: process.env.NEXT_PUBLIC_APPWRITE_CHAT_ROOMS_COLLECTION_ID!,
  ANALYTICS: process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_COLLECTION_ID!,
  QUESTS: process.env.NEXT_PUBLIC_APPWRITE_QUESTS_COLLECTION_ID!,
  PUSH_SUBSCRIPTIONS: "push-subscriptions-collection", // This was missing in the guide's env vars
}

export default client
