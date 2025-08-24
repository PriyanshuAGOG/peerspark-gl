#!/bin/bash

# This script sets up the entire Appwrite backend for the PeerSpark project.

DATABASE_ID="peerspark-main-db"
DATABASE_NAME="PeerSpark Main Database"

echo "🚀 Starting Appwrite setup for PeerSpark..."

# 1. Create Database
echo "--- Creating Database ---"
appwrite databases create --databaseId "$DATABASE_ID" --name "$DATABASE_NAME"

# 2. Create Collections and Attributes
echo "--- Creating Collections & Attributes ---"

# Users Collection
echo "Creating collection: Users (users)..."
appwrite databases create-collection --databaseId "$DATABASE_ID" --collectionId "users" --name "Users" --permissions 'read("any")'
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "userId" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "username" --size 50 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "displayName" --size 100 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "email" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "bio" --size 500 --required=false
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "avatar" --size 255 --required=false
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "followersCount" --required=false --default=0
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "followingCount" --required=false --default=0
appwrite databases create-boolean-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "hasBetaAccess" --required=false --default=false
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "users" --key "plan" --size 50 --required=false --default="free"

# Posts Collection
echo "Creating collection: Posts (posts)..."
appwrite databases create-collection --databaseId "$DATABASE_ID" --collectionId "posts" --name "Posts" --permissions 'read("any")'
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "authorId" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "content" --size 5000 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "type" --size 50 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "podId" --size 255 --required=false
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "likesCount" --required=false --default=0
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "commentsCount" --required=false --default=0
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "bookmarksCount" --required=false --default=0
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "tags" --size 1000 --required=false --default="[]"
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "posts" --key "mediaUrls" --size 2000 --required=false --default="[]"

# Pods Collection
echo "Creating collection: Pods (pods)..."
appwrite databases create-collection --databaseId "$DATABASE_ID" --collectionId "pods" --name "Pods" --permissions 'read("any")'
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "teamId" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "name" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "description" --size 2000 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "creatorId" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "members" --size 5000 --required=true --default="[]"
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "subject" --size 100 --required=false
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "difficulty" --size 50 --required=false --default="Beginner"
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "tags" --size 1000 --required=false --default="[]"
appwrite databases create-boolean-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "isPublic" --required=false --default=true
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "memberCount" --required=false --default=1
appwrite databases create-integer-attribute --databaseId "$DATABASE_ID" --collectionId "pods" --key "totalResources" --required=false --default=0

# Waitlist Collection
echo "Creating collection: Waitlist (waitlist)..."
appwrite databases create-collection --databaseId "$DATABASE_ID" --collectionId "waitlist" --name "Waitlist" --permissions 'create("any")'
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "waitlist" --key "name" --size 255 --required=true
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "waitlist" --key "email" --size 255 --required=true

# Access Codes Collection
echo "Creating collection: Access Codes (access_codes)..."
appwrite databases create-collection --databaseId "$DATABASE_ID" --collectionId "access_codes" --name "Access Codes" --permissions 'read("users")'
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "access_codes" --key "code" --size 255 --required=true
appwrite databases create-boolean-attribute --databaseId "$DATABASE_ID" --collectionId "access_codes" --key "isClaimed" --required=false --default=false
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "access_codes" --key "claimedBy" --size 255 --required=false
appwrite databases create-string-attribute --databaseId "$DATABASE_ID" --collectionId "access_codes" --key "claimedAt" --size 255 --required=false

# 3. Create Indexes
echo "--- Creating Database Indexes ---"
appwrite databases create-index --databaseId "$DATABASE_ID" --collectionId "users" --key "userId_index" --type "key" --attributes "userId"
appwrite databases create-index --databaseId "$DATABASE_ID" --collectionId "users" --key "username_index" --type "key" --attributes "username"
appwrite databases create-index --databaseId "$DATABASE_ID" --collectionId "waitlist" --key "email_index" --type "unique" --attributes "email"
appwrite databases create-index --databaseId "$DATABASE_ID" --collectionId "access_codes" --key "code_index" --type "unique" --attributes "code"

# 4. Create Storage Buckets
echo "--- Creating Storage Buckets ---"
appwrite storage create-bucket --bucketId "avatars" --name "Avatars" --permissions 'create("users"), read("any")' --fileSecurity=true --allowedFileExtensions "jpg,jpeg,png,webp"
appwrite storage create-bucket --bucketId "resources" --name "Study Resources" --permissions 'create("users"), read("any")' --fileSecurity=true
appwrite storage create-bucket --bucketId "attachments" --name "Chat Attachments" --permissions 'create("users"), read("any")' --fileSecurity=true
appwrite storage create-bucket --bucketId "post_images" --name "Post Images" --permissions 'create("users"), read("any")' --fileSecurity=true

echo "✅ Appwrite setup is complete!"
