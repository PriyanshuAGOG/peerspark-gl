# PeerSpark - AI-Powered Learning Platform

## Overview

PeerSpark is a comprehensive learning platform that combines collaborative pod-based learning with AI-powered scheduling, quest systems, and progress tracking. The platform enables users to join learning pods, complete daily quests, track progress, and receive intelligent reminders to maintain learning streaks.

## Features Implemented

### 1. Pod Scheduler Modal & AI Integration
- **Location**: `app/app/pods/page.tsx`
- **Features**:
  - AI-powered roadmap generation
  - Subject selection with difficulty levels
  - Duration and daily study time configuration
  - Reminder preferences
  - Integration with OpenAI API for personalized learning paths

### 2. Enhanced Calendar with Status Indicators
- **Location**: `app/app/calendar/page.tsx`
- **Features**:
  - Daily task status indicators (completed, missed, pending, in-progress)
  - Quest difficulty levels and point values
  - Weekly progress overview with streak tracking
  - Interactive task management
  - Responsive design with mobile optimization

### 3. Daily Tests & Quests System
- **Location**: `app/app/pods/[podId]/page.tsx`
- **Features**:
  - Three-tab interface: Learn, Quiz, Quest
  - Interactive lessons with rich content
  - Timed quizzes with multiple-choice questions
  - Coding quests with starter code and test cases
  - Progress tracking and point awards
  - Hint system and detailed feedback

### 4. Progress Tracking on User Profiles
- **Location**: `app/app/profile/page.tsx`
- **Features**:
  - Current streak tracking
  - Weekly completion statistics
  - Skill progression with XP systems
  - Recent quest activity with status indicators
  - Monthly progress charts
  - Achievement badges and milestones

### 5. Pod Progress Dashboard & Leaderboard
- **Location**: `app/app/pods/[podId]/page.tsx` (Progress tab)
- **Features**:
  - Member performance metrics
  - Weekly progress charts
  - Collective achievements
  - Individual progress breakdowns
  - Gamified ranking system
  - Team collaboration insights

### 6. Notification Center & Reminder System
- **Location**: `components/notification-center.tsx`
- **Features**:
  - Real-time notification center
  - Customizable notification preferences
  - Daily reminder scheduling
  - Quiet hours configuration
  - Push notification support
  - Service worker integration

## Technical Architecture

### Frontend Components
- **React 18** with Next.js 14 App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend APIs
- **Next.js API Routes** for server-side logic
- **RESTful API** design patterns
- **Mock data** for development (replace with actual database)

### Key API Endpoints
- `POST /api/pods/schedule/generate` - AI roadmap generation
- `GET /api/notifications` - Fetch user notifications
- `POST /api/notifications` - Create new notification
- `PATCH /api/notifications` - Update notification status
- `GET/POST /api/notifications/settings` - Notification preferences

### Service Worker Features
- **Push notifications** support
- **Offline caching** for core functionality
- **Background sync** capabilities
- **Notification click handling**

## Appwrite Integration Guide

### Prerequisites
1. Create an Appwrite account at [appwrite.io](https://appwrite.io)
2. Create a new project in Appwrite console
3. Note down your project ID and endpoint URL

### Environment Variables Setup
Add these environment variables to your Vercel project:

\`\`\`env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key

# Collections
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_PODS_COLLECTION_ID=pods
NEXT_PUBLIC_APPWRITE_QUESTS_COLLECTION_ID=quests
NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID=progress
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
NEXT_PUBLIC_APPWRITE_SCHEDULES_COLLECTION_ID=schedules

# Storage
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_bucket_id

# Authentication
NEXT_PUBLIC_APPWRITE_AUTH_ENDPOINT=https://cloud.appwrite.io/v1
\`\`\`

### Database Schema

#### Users Collection
\`\`\`json
{
  "name": "users",
  "attributes": [
    {"key": "email", "type": "string", "required": true},
    {"key": "username", "type": "string", "required": true},
    {"key": "displayName", "type": "string", "required": true},
    {"key": "avatar", "type": "string", "required": false},
    {"key": "bio", "type": "string", "required": false},
    {"key": "skills", "type": "string", "array": true},
    {"key": "currentStreak", "type": "integer", "default": 0},
    {"key": "totalXP", "type": "integer", "default": 0},
    {"key": "level", "type": "integer", "default": 1},
    {"key": "joinedAt", "type": "datetime", "required": true},
    {"key": "lastActive", "type": "datetime", "required": true}
  ]
}
\`\`\`

#### Pods Collection
\`\`\`json
{
  "name": "pods",
  "attributes": [
    {"key": "name", "type": "string", "required": true},
    {"key": "description", "type": "string", "required": true},
    {"key": "subject", "type": "string", "required": true},
    {"key": "difficulty", "type": "string", "required": true},
    {"key": "memberCount", "type": "integer", "default": 0},
    {"key": "maxMembers", "type": "integer", "default": 50},
    {"key": "createdBy", "type": "string", "required": true},
    {"key": "members", "type": "string", "array": true},
    {"key": "tags", "type": "string", "array": true},
    {"key": "isActive", "type": "boolean", "default": true},
    {"key": "createdAt", "type": "datetime", "required": true}
  ]
}
\`\`\`

#### Quests Collection
\`\`\`json
{
  "name": "quests",
  "attributes": [
    {"key": "title", "type": "string", "required": true},
    {"key": "description", "type": "string", "required": true},
    {"key": "type", "type": "string", "required": true},
    {"key": "difficulty", "type": "string", "required": true},
    {"key": "points", "type": "integer", "required": true},
    {"key": "podId", "type": "string", "required": true},
    {"key": "content", "type": "string", "required": true},
    {"key": "questions", "type": "string", "required": false},
    {"key": "starterCode", "type": "string", "required": false},
    {"key": "testCases", "type": "string", "required": false},
    {"key": "hints", "type": "string", "array": true},
    {"key": "timeLimit", "type": "integer", "required": false},
    {"key": "isActive", "type": "boolean", "default": true},
    {"key": "createdAt", "type": "datetime", "required": true}
  ]
}
\`\`\`

#### Progress Collection
\`\`\`json
{
  "name": "progress",
  "attributes": [
    {"key": "userId", "type": "string", "required": true},
    {"key": "questId", "type": "string", "required": true},
    {"key": "podId", "type": "string", "required": true},
    {"key": "status", "type": "string", "required": true},
    {"key": "score", "type": "integer", "default": 0},
    {"key": "timeSpent", "type": "integer", "default": 0},
    {"key": "attempts", "type": "integer", "default": 0},
    {"key": "completedAt", "type": "datetime", "required": false},
    {"key": "startedAt", "type": "datetime", "required": true},
    {"key": "answers", "type": "string", "required": false},
    {"key": "feedback", "type": "string", "required": false}
  ]
}
\`\`\`

#### Notifications Collection
\`\`\`json
{
  "name": "notifications",
  "attributes": [
    {"key": "userId", "type": "string", "required": true},
    {"key": "type", "type": "string", "required": true},
    {"key": "title", "type": "string", "required": true},
    {"key": "message", "type": "string", "required": true},
    {"key": "actionUrl", "type": "string", "required": false},
    {"key": "read", "type": "boolean", "default": false},
    {"key": "createdAt", "type": "datetime", "required": true}
  ]
}
\`\`\`

#### Schedules Collection
\`\`\`json
{
  "name": "schedules",
  "attributes": [
    {"key": "userId", "type": "string", "required": true},
    {"key": "podId", "type": "string", "required": true},
    {"key": "subject", "type": "string", "required": true},
    {"key": "duration", "type": "integer", "required": true},
    {"key": "dailyTime", "type": "integer", "required": true},
    {"key": "difficulty", "type": "string", "required": true},
    {"key": "roadmap", "type": "string", "required": true},
    {"key": "reminderTime", "type": "string", "required": true},
    {"key": "reminderDays", "type": "string", "array": true},
    {"key": "isActive", "type": "boolean", "default": true},
    {"key": "createdAt", "type": "datetime", "required": true}
  ]
}
\`\`\`

### Authentication Setup

1. **Enable Authentication** in Appwrite console
2. **Configure OAuth providers** (optional)
3. **Set up email/password authentication**
4. **Configure security settings**

### Storage Setup

1. **Create storage bucket** for user avatars and quest assets
2. **Configure permissions** for read/write access
3. **Set up file validation** rules

### Functions Setup (Optional)

Create Appwrite functions for:
- **AI roadmap generation** using OpenAI API
- **Notification scheduling** and delivery
- **Progress calculation** and streak tracking
- **Leaderboard updates** and ranking

### Integration Steps

1. **Install Appwrite SDK**:
\`\`\`bash
npm install appwrite
\`\`\`

2. **Initialize Appwrite client**:
\`\`\`typescript
import { Client, Account, Databases, Storage } from 'appwrite'

const client = new Client()
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
\`\`\`

3. **Replace mock data** with Appwrite queries
4. **Implement authentication** flow
5. **Set up real-time subscriptions** for live updates
6. **Configure push notifications** with Appwrite messaging

## Deployment Instructions

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Set up Appwrite integration** in Vercel marketplace
4. **Deploy application** with automatic builds

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- [ ] `APPWRITE_API_KEY`
- [ ] `OPENAI_API_KEY` (for AI features)
- [ ] All collection IDs
- [ ] Storage bucket ID
- [ ] VAPID keys for push notifications

### Post-Deployment Setup

1. **Test authentication** flow
2. **Verify database** connections
3. **Test push notifications** on mobile devices
4. **Configure domain** and SSL certificates
5. **Set up monitoring** and analytics

## Usage Guide

### For Users

1. **Sign up/Login** to create account
2. **Join or create pods** based on learning interests
3. **Generate AI roadmaps** using the scheduler modal
4. **Complete daily quests** to maintain streaks
5. **Track progress** on profile and calendar pages
6. **Configure notifications** for optimal learning reminders

### For Administrators

1. **Monitor pod activity** through analytics dashboard
2. **Manage user accounts** and permissions
3. **Create custom quests** and learning content
4. **Configure system-wide** notification settings
5. **Analyze learning patterns** and engagement metrics

## Troubleshooting

### Common Issues

1. **Notifications not working**: Check browser permissions and service worker registration
2. **AI roadmap generation failing**: Verify OpenAI API key and rate limits
3. **Real-time updates not syncing**: Check Appwrite websocket connections
4. **Mobile responsiveness issues**: Test on various device sizes

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
DEBUG=true
\`\`\`

### Support

For technical support and feature requests:
- Create GitHub issues for bugs
- Join community Discord for discussions
- Check documentation for API references
- Contact support team for enterprise features

## Contributing

1. **Fork repository** and create feature branch
2. **Follow code standards** and TypeScript guidelines
3. **Add tests** for new functionality
4. **Update documentation** for API changes
5. **Submit pull request** with detailed description

## License

MIT License - see LICENSE file for details.
