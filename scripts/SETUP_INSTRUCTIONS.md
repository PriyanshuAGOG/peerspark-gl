# 🚀 PeerSpark Appwrite Complete Setup Guide

This guide will walk you through setting up the complete Appwrite backend for PeerSpark using the automated setup script.

## ✅ Prerequisites

1. **Appwrite Account & Project**
   - Create account at [https://cloud.appwrite.io](https://cloud.appwrite.io)
   - Create new project with ID: `68bbf8f300298a61f4a6`
   - Note your endpoint: `https://fra.cloud.appwrite.io/v1`

2. **Node.js & CLI Tools**
   ```bash
   # Install Appwrite CLI globally
   npm install -g appwrite-cli
   
   # Login to Appwrite
   appwrite login
   ```

3. **Project Setup**
   ```bash
   # Navigate to scripts directory
   cd scripts
   
   # Install dependencies
   npm install
   ```

## 🔧 Setup Process

### Step 1: Run the Setup Script

```bash
# From the scripts directory
node setup-appwrite.js
```

The script will automatically:
- ✅ Create main database: `peerspark-main-db`
- ✅ Create all 14 collections with proper attributes and indexes
- ✅ Setup storage buckets for avatars, resources, and attachments
- ✅ Configure permissions and security rules

### Step 2: Manual Configuration (Required)

After running the script, you need to complete these manual steps in the Appwrite dashboard:

#### A. Create API Key
1. Go to your project in Appwrite dashboard
2. Navigate to **Settings > API Keys**
3. Click **Create API Key**
4. Name: `PeerSpark Server Key`
5. **Scopes**: Select ALL scopes (full access)
6. Click **Create**
7. Copy the generated API key
8. Add to `.env.local` file:
   ```bash
   APPWRITE_API_KEY=your-api-key-here
   ```

#### B. Configure Authentication Settings
1. Go to **Auth > Settings**
2. **Session Length**: Set to `365 days`
3. **Password History**: Set to `5`
4. **Password Dictionary**: ✅ Enable
5. **Personal Data**: ✅ Enable
6. **Mock Numbers**: ❌ Disable (for production)

#### C. Setup OAuth Providers (Optional)
If you want social login:

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add to Appwrite: **Auth > OAuth2 > Google**

2. **GitHub OAuth**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create OAuth App
   - Add to Appwrite: **Auth > OAuth2 > GitHub**

#### D. Configure Email Templates
1. Go to **Auth > Templates**
2. Customize email verification and password reset templates
3. Set your app name and branding

## 📊 Collections Created

The setup script creates these collections:

| Collection ID | Purpose | Permissions |
|---------------|---------|-------------|
| `users-collection` | User profiles and metadata | `read("any")`, `write("users")` |
| `posts-collection` | Social feed posts | `read("any")`, `write("users")` |
| `pods-collection` | Study groups/communities | `read("any")`, `write("users")` |
| `messages-collection` | Chat messages | `read("users")`, `write("users")` |
| `chat-rooms-collection` | Chat room metadata | `read("users")`, `write("users")` |
| `resources-collection` | Shared files/documents | `read("any")`, `write("users")` |
| `notifications-collection` | User notifications | `read("users")`, `write("users")` |
| `events-collection` | Calendar events | `read("users")`, `write("users")` |
| `follows-collection` | User follow relationships | `read("users")`, `write("users")` |
| `likes-collection` | Post/resource likes | `read("users")`, `write("users")` |
| `bookmarks-collection` | Bookmarked content | `read("users")`, `write("users")` |
| `comments-collection` | Post comments | `read("any")`, `write("users")` |
| `analytics-collection` | User analytics data | `read("users")`, `write("users")` |
| `quests-collection` | Gamification quests | `read("any")`, `write("users")` |

## 📁 Storage Buckets Created

| Bucket ID | Purpose | Max Size | Allowed Extensions |
|-----------|---------|----------|-------------------|
| `avatars` | User profile pictures | 5MB | jpg, jpeg, png, gif, webp |
| `resources` | Study materials | 50MB | pdf, doc, docx, txt, ppt, pptx, xls, xlsx, jpg, jpeg, png, gif, mp4, mp3 |
| `attachments` | Chat file attachments | 25MB | jpg, jpeg, png, gif, pdf, doc, docx, txt, mp4, mp3, zip |

## 🧪 Testing Your Setup

### 1. Verify Database
1. Check Appwrite dashboard **Databases**
2. Confirm `peerspark-main-db` exists
3. Verify all 14 collections are created

### 2. Test Application
```bash
# From project root
npm run dev
```

1. Visit `http://localhost:3000`
2. Try registering a new account
3. Check if user appears in `users-collection`
4. Test creating a post
5. Verify post appears in `posts-collection`

### 3. Check Storage
1. Try uploading a profile picture
2. Verify file appears in `avatars` bucket

## 🔍 Troubleshooting

### Common Issues

**1. "Collection already exists" errors**
- This is normal - the script skips existing collections
- No action needed

**2. "Permission denied" errors**
- Ensure you're logged into Appwrite CLI with admin access
- Check that you have the correct project ID

**3. "API Key not found" errors**
- Make sure you created the API key manually
- Verify it's added to `.env.local` file
- Restart your development server

**4. Authentication not working**
- Check environment variables are correct
- Ensure `.env.local` file exists and is properly formatted
- Restart development server after env changes

### Getting Help

If you encounter issues:

1. **Check logs**: The setup script provides detailed logging
2. **Verify dashboard**: Check Appwrite dashboard for created resources
3. **Environment file**: Ensure `.env.local` has all required variables
4. **Restart services**: Try restarting your development server

## 🎯 Next Steps

After successful setup:

1. **Add OpenAI API Key** (for AI features):
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   ```

2. **Configure Push Notifications** (optional):
   - Generate VAPID keys
   - Add to environment variables

3. **Deploy Functions** (optional):
   - Deploy the included Appwrite functions for AI chat and analytics

4. **Production Setup**:
   - Configure custom domain
   - Set up email service (SendGrid)
   - Enable analytics (Google Analytics)

## 📋 Environment Variables Checklist

Make sure your `.env.local` has these variables:

- [x] `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- [x] `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- [x] `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- [x] `APPWRITE_API_KEY` (created manually)
- [ ] `OPENAI_API_KEY` (optional, for AI features)
- [ ] `SENDGRID_API_KEY` (optional, for emails)

---

🎉 **Congratulations!** Your PeerSpark backend is now fully configured and ready for development!