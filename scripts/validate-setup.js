#!/usr/bin/env node

/**
 * PeerSpark Appwrite Setup Validation Script
 * 
 * This script validates that the Appwrite setup was completed successfully
 * by checking for the existence of all required collections, storage buckets,
 * and configurations.
 * 
 * Usage: node scripts/validate-setup.js
 */

const { Client, Databases, Storage } = require('node-appwrite');

const CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68bbf8f300298a61f4a6',
  databaseId: 'peerspark-main-db',
};

const REQUIRED_COLLECTIONS = [
  'users-collection',
  'posts-collection',
  'pods-collection',
  'messages-collection',
  'chat-rooms-collection',
  'resources-collection',
  'notifications-collection',
  'events-collection',
  'follows-collection',
  'likes-collection',
  'bookmarks-collection',
  'comments-collection',
  'analytics-collection',
  'quests-collection'
];

const REQUIRED_BUCKETS = [
  'avatars',
  'resources',
  'attachments'
];

class SetupValidator {
  constructor() {
    this.client = new Client()
      .setEndpoint(CONFIG.endpoint)
      .setProject(CONFIG.projectId);
    
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    
    console.log('🔍 PeerSpark Setup Validation Started');
    console.log(`📍 Endpoint: ${CONFIG.endpoint}`);
    console.log(`🆔 Project ID: ${CONFIG.projectId}`);
  }

  async validate() {
    try {
      console.log('\\n🔧 Validating Appwrite setup...\\n');
      
      let allValid = true;
      
      // Check database
      const databaseValid = await this.validateDatabase();
      allValid = allValid && databaseValid;
      
      // Check collections
      const collectionsValid = await this.validateCollections();
      allValid = allValid && collectionsValid;
      
      // Check storage buckets
      const storageValid = await this.validateStorage();
      allValid = allValid && storageValid;
      
      // Check environment variables
      const envValid = this.validateEnvironment();
      allValid = allValid && envValid;
      
      // Final result
      if (allValid) {
        console.log('\\n✅ All validations passed! Your PeerSpark backend is ready.');
        console.log('\\n🚀 Next steps:');
        console.log('1. Create API key in Appwrite dashboard');
        console.log('2. Add APPWRITE_API_KEY to .env.local');
        console.log('3. Run: npm run dev');
        console.log('4. Test registration and posting features');
      } else {
        console.log('\\n❌ Some validations failed. Please check the errors above.');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  async validateDatabase() {
    console.log('📊 Validating database...');
    
    try {
      const database = await this.databases.get(CONFIG.databaseId);
      console.log(`✅ Database '${database.name}' found`);
      return true;
    } catch (error) {
      console.error(`❌ Database '${CONFIG.databaseId}' not found:`, error.message);
      return false;
    }
  }

  async validateCollections() {
    console.log('\\n📚 Validating collections...');
    
    let allValid = true;
    
    for (const collectionId of REQUIRED_COLLECTIONS) {
      try {
        const collection = await this.databases.getCollection(CONFIG.databaseId, collectionId);
        console.log(`✅ Collection '${collection.name}' found`);
      } catch (error) {
        console.error(`❌ Collection '${collectionId}' not found:`, error.message);
        allValid = false;
      }
    }
    
    return allValid;
  }

  async validateStorage() {
    console.log('\\n📁 Validating storage buckets...');
    
    let allValid = true;
    
    for (const bucketId of REQUIRED_BUCKETS) {
      try {
        const bucket = await this.storage.getBucket(bucketId);
        console.log(`✅ Storage bucket '${bucket.name}' found`);
      } catch (error) {
        console.error(`❌ Storage bucket '${bucketId}' not found:`, error.message);
        allValid = false;
      }
    }
    
    return allValid;
  }

  validateEnvironment() {
    console.log('\\n🔧 Validating environment variables...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
      'NEXT_PUBLIC_APPWRITE_STORAGE_ID'
    ];
    
    const optionalEnvVars = [
      'APPWRITE_API_KEY',
      'OPENAI_API_KEY'
    ];
    
    let allValid = true;
    
    // Check if .env.local exists
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found');
      return false;
    }
    
    // Read environment file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (envContent.includes(`${envVar}=`)) {
        console.log(`✅ ${envVar} found`);
      } else {
        console.error(`❌ ${envVar} missing from .env.local`);
        allValid = false;
      }
    }
    
    // Check optional variables
    for (const envVar of optionalEnvVars) {
      if (envContent.includes(`${envVar}=`)) {
        console.log(`ℹ️  ${envVar} found (optional)`);
      } else {
        console.log(`⚠️  ${envVar} missing (optional)`);
      }
    }
    
    return allValid;
  }
}

// Execute validation
const validator = new SetupValidator();
validator.validate();

module.exports = SetupValidator;