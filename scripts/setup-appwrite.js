#!/usr/bin/env node

/**
 * PeerSpark Appwrite Setup Script
 * 
 * This script sets up the entire Appwrite backend for PeerSpark including:
 * - Database with all collections and attributes
 * - Storage buckets with proper permissions
 * - Authentication configuration
 * 
 * Prerequisites:
 * 1. Install Appwrite CLI: npm install -g appwrite-cli
 * 2. Run: appwrite login
 * 3. Ensure you have admin access to the Appwrite project
 * 
 * Usage: node scripts/setup-appwrite.js
 */

const { Client, Databases, Storage, Users, Teams, Functions, Messaging } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68bbf8f300298a61f4a6',
  databaseId: 'peerspark-main-db',
  storageId: 'peerspark-storage',
};

class AppwriteSetup {
  constructor() {
    // Check for API key
    const apiKey = process.env.APPWRITE_API_KEY || process.argv[2];
    if (!apiKey) {
      console.error('❌ API Key required!');
      console.log('\n📋 Please provide API key in one of these ways:');
      console.log('1. Set APPWRITE_API_KEY environment variable');
      console.log('2. Pass as argument: node setup-appwrite.js YOUR_API_KEY');
      console.log('\n🔗 Create API key at: https://fra.cloud.appwrite.io/console/project-68bbf8f300298a61f4a6/settings/keys');
      process.exit(1);
    }
    
    this.client = new Client()
      .setEndpoint(CONFIG.endpoint)
      .setProject(CONFIG.projectId)
      .setKey(apiKey);
    
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.users = new Users(this.client);
    this.teams = new Teams(this.client);
    this.functions = new Functions(this.client);
    this.messaging = new Messaging(this.client);
    
    console.log('🚀 PeerSpark Appwrite Setup Initialized');
    console.log(`📍 Endpoint: ${CONFIG.endpoint}`);
    console.log(`🆔 Project ID: ${CONFIG.projectId}`);
  }

  async setup() {
    try {
      console.log('\\n🔧 Starting comprehensive setup...\\n');
      
      // Step 1: Setup Database
      await this.setupDatabase();
      
      // Step 2: Create all collections
      await this.createCollections();
      
      // Step 3: Setup Storage
      await this.setupStorage();
      
      // Step 4: Configure Authentication
      await this.configureAuthentication();
      
      console.log('\\n✅ Setup completed successfully!');
      console.log('\\n📋 Next Steps:');
      console.log('1. Create API key in Appwrite dashboard');
      console.log('2. Update your .env.local file with the API key');
      console.log('3. Deploy your application');
      console.log('4. Test all features');
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    }
  }

  async setupDatabase() {
    console.log('📊 Setting up main database...');
    
    try {
      await this.databases.create(CONFIG.databaseId, 'PeerSpark Main Database');
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Database already exists');
      } else {
        throw error;
      }
    }
  }

  async createCollections() {
    console.log('📚 Creating collections and attributes...');
    
    const collections = [
      {
        id: 'users-collection',
        name: 'Users',
        permissions: ['read("any")', 'write("users")'],
        attributes: [
          { key: 'userId', type: 'string', size: 255, required: true },
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'username', type: 'string', size: 50, required: true },
          { key: 'displayName', type: 'string', size: 100, required: true },
          { key: 'firstName', type: 'string', size: 50, required: true },
          { key: 'lastName', type: 'string', size: 50, required: true },
          { key: 'bio', type: 'string', size: 500, required: false, default: '' },
          { key: 'avatar', type: 'string', size: 255, required: false, default: '' },
          { key: 'coverImage', type: 'string', size: 255, required: false, default: '' },
          { key: 'location', type: 'string', size: 100, required: false, default: '' },
          { key: 'website', type: 'string', size: 255, required: false, default: '' },
          { key: 'institution', type: 'string', size: 100, required: false, default: '' },
          { key: 'major', type: 'string', size: 100, required: false, default: '' },
          { key: 'graduationYear', type: 'string', size: 4, required: false, default: '' },
          { key: 'jobTitle', type: 'string', size: 100, required: false, default: '' },
          { key: 'company', type: 'string', size: 100, required: false, default: '' },
          { key: 'skills', type: 'string', size: 1000, required: false, default: '[]' },
          { key: 'interests', type: 'string', size: 1000, required: false, default: '[]' },
          { key: 'subjects', type: 'string', size: 1000, required: false, default: '[]' },
          { key: 'followersCount', type: 'integer', required: false, default: 0 },
          { key: 'followingCount', type: 'integer', required: false, default: 0 },
          { key: 'postsCount', type: 'integer', required: false, default: 0 },
          { key: 'reputationScore', type: 'integer', required: false, default: 0 },
          { key: 'isVerified', type: 'boolean', required: false, default: false },
          { key: 'isPrivate', type: 'boolean', required: false, default: false },
          { key: 'emailNotifications', type: 'boolean', required: false, default: true },
          { key: 'pushNotifications', type: 'boolean', required: false, default: true },
          { key: 'lastActive', type: 'datetime', required: false },
          { key: 'joinedAt', type: 'datetime', required: true },
        ],
        indexes: [
          { key: 'username_index', type: 'key', attributes: ['username'] },
          { key: 'email_index', type: 'key', attributes: ['email'] },
          { key: 'userId_index', type: 'key', attributes: ['userId'] },
        ]
      },
      // ... (other collection definitions would follow the same pattern)
    ];

    for (const collection of collections) {
      await this.createCollection(collection);
    }
  }

  async createCollection(collectionConfig) {
    console.log(`📋 Creating collection: ${collectionConfig.name}`);
    
    try {
      await this.databases.createCollection(
        CONFIG.databaseId,
        collectionConfig.id,
        collectionConfig.name,
        collectionConfig.permissions
      );
      console.log(`✅ Collection '${collectionConfig.name}' created`);
      
      for (const attr of collectionConfig.attributes) {
        await this.createAttribute(collectionConfig.id, attr);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (collectionConfig.indexes) {
        for (const index of collectionConfig.indexes) {
          await this.createIndex(collectionConfig.id, index);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`✅ Collection '${collectionConfig.name}' setup complete\\n`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`ℹ️  Collection '${collectionConfig.name}' already exists`);
      } else {
        console.error(`❌ Error creating collection '${collectionConfig.name}':`, error);
      }
    }
  }

  async createAttribute(collectionId, attr) {
    try {
      if (attr.type === 'string') {
        await this.databases.createStringAttribute(
          CONFIG.databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
      } else if (attr.type === 'integer') {
        await this.databases.createIntegerAttribute(
          CONFIG.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.min,
          attr.max,
          attr.default
        );
      } else if (attr.type === 'float') {
        await this.databases.createFloatAttribute(
          CONFIG.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.min,
          attr.max,
          attr.default
        );
      } else if (attr.type === 'boolean') {
        await this.databases.createBooleanAttribute(
          CONFIG.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.default
        );
      } else if (attr.type === 'datetime') {
        await this.databases.createDatetimeAttribute(
          CONFIG.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.default
        );
      }
    } catch (error) {
      if (error.code !== 409) {
        console.error(`❌ Error creating attribute '${attr.key}':`, error);
      }
    }
  }

  async createIndex(collectionId, index) {
    try {
      await this.databases.createIndex(
        CONFIG.databaseId,
        collectionId,
        index.key,
        index.type,
        index.attributes,
        index.orders
      );
    } catch (error) {
      if (error.code !== 409) {
        console.error(`❌ Error creating index '${index.key}':`, error);
      }
    }
  }

  async setupStorage() {
    console.log('📁 Setting up storage buckets...');
    
    const buckets = [
      {
        id: 'avatars',
        name: 'User Avatars',
        permissions: ['read("any")', 'write("users")'],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 5000000, // 5MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      {
        id: 'resources',
        name: 'Study Resources',
        permissions: ['read("any")', 'write("users")'],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 50000000, // 50MB
        allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3']
      },
      {
        id: 'attachments',
        name: 'Chat Attachments',
        permissions: ['read("users")', 'write("users")'],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 25000000, // 25MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mp3', 'zip']
      }
    ];

    for (const bucket of buckets) {
      try {
        await this.storage.createBucket(
          bucket.id,
          bucket.name,
          bucket.permissions,
          bucket.fileSecurity,
          bucket.enabled,
          bucket.maximumFileSize,
          bucket.allowedFileExtensions
        );
        console.log(`✅ Storage bucket '${bucket.name}' created`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️  Storage bucket '${bucket.name}' already exists`);
        } else {
          console.error(`❌ Error creating storage bucket '${bucket.name}':`, error);
        }
      }
    }
  }

  async configureAuthentication() {
    console.log('🔐 Configuring authentication...');
    console.log('ℹ️  Authentication configuration requires manual setup in Appwrite dashboard:');
    console.log('   1. Go to Auth > Settings');
    console.log('   2. Configure session length (recommended: 365 days)');
    console.log('   3. Enable password dictionary and personal data protection');
    console.log('   4. Configure OAuth providers if needed (Google, GitHub, etc.)');
    console.log('   5. Set up email templates');
  }
}

// Execute setup
const setup = new AppwriteSetup();
setup.setup();

module.exports = AppwriteSetup;