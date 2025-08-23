const https = require('https');

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('Error: Missing required environment variables APPWRITE_PROJECT_ID or APPWRITE_API_KEY.');
  process.exit(1);
}

const DATABASE_ID = 'peerspark-main-db';
const DATABASE_NAME = 'PeerSpark Main Database';

const collections = [
    { id: 'users', name: 'Users', permissions: ['read("any")'], attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'username', type: 'string', size: 50, required: true },
        { key: 'displayName', type: 'string', size: 100, required: true },
        { key: 'email', type: 'string', size: 255, required: true },
        { key: 'bio', type: 'string', size: 500, required: false },
        { key: 'avatar', type: 'string', size: 255, required: false },
        { key: 'followersCount', type: 'integer', required: false, default: 0 },
        { key: 'followingCount', type: 'integer', required: false, default: 0 },
        { key: 'hasBetaAccess', type: 'boolean', required: false, default: false },
    ]},
    { id: 'waitlist', name: 'Waitlist', permissions: ['create("any")'], attributes: [
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'email', type: 'string', size: 255, required: true },
    ]},
    { id: 'access_codes', name: 'Access Codes', permissions: [], attributes: [
        { key: 'code', type: 'string', size: 255, required: true },
        { key: 'isClaimed', type: 'boolean', required: false, default: false },
        { key: 'claimedBy', type: 'string', size: 255, required: false },
        { key: 'claimedAt', type: 'string', size: 255, required: false },
    ]},
    // Add other collections here if needed
];

const indexes = [
    { collectionId: 'users', key: 'userId_index', type: 'key', attributes: ['userId'] },
    { collectionId: 'users', key: 'username_index', type: 'key', attributes: ['username'] },
    { collectionId: 'waitlist', key: 'email_index', type: 'unique', attributes: ['email'] },
    { collectionId: 'access_codes', key: 'code_index', type: 'unique', attributes: ['code'] },
];

const buckets = [
    { id: 'avatars', name: 'Avatars', permissions: ['create("users")', 'read("any")'], options: { fileSecurity: true, allowedFileExtensions: ["jpg","jpeg","png","webp"] } },
    { id: 'resources', name: 'Study Resources', permissions: ['create("users")', 'read("any")'], options: { fileSecurity: true } },
    { id: 'attachments', name: 'Chat Attachments', permissions: ['create("users")', 'read("any")'], options: { fileSecurity: true } },
    { id: 'post_images', name: 'Post Images', permissions: ['create("users")', 'read("any")'], options: { fileSecurity: true } },
];


function apiRequest(path, method, body = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(ENDPOINT).hostname,
      path: `${new URL(ENDPOINT).pathname}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || '{}'));
        } else {
          console.error('API Error Response:', data);
          reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    if (method !== 'GET') {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function setup() {
  console.log('🚀 Starting Appwrite setup via REST API...');

  try {
    // 1. Create Database
    console.log('--- Creating Database ---');
    await apiRequest('/databases', 'POST', { databaseId: DATABASE_ID, name: DATABASE_NAME });
    console.log(`Database '${DATABASE_NAME}' created.`);
  } catch (e) {
    if (e.message.includes('database_already_exists')) {
      console.log('Database already exists, skipping.');
    } else {
      throw e;
    }
  }

  // 2. Create Collections and Attributes
  console.log('\n--- Creating Collections & Attributes ---');
  for (const collection of collections) {
    try {
      await apiRequest(`/databases/${DATABASE_ID}/collections`, 'POST', {
        collectionId: collection.id,
        name: collection.name,
        permissions: collection.permissions,
      });
      console.log(`Collection '${collection.name}' created.`);

      // Add a delay before creating attributes
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const attr of collection.attributes) {
        let path = `/databases/${DATABASE_ID}/collections/${collection.id}/attributes/${attr.type}`;
        await apiRequest(path, 'POST', { ...attr });
        console.log(`   - Attribute '${attr.key}' created.`);
      }
    } catch (e) {
      if (e.message.includes('collection_already_exists')) {
        console.log(`Collection '${collection.name}' already exists, skipping.`);
      } else {
        console.error(`Failed to create collection ${collection.name}:`, e.message);
      }
    }
  }

  // 3. Create Indexes
  console.log('\n--- Creating Indexes ---');
  for (const index of indexes) {
      try {
        // Add a delay before creating indexes
        await new Promise(resolve => setTimeout(resolve, 1000));
        await apiRequest(`/databases/${DATABASE_ID}/collections/${index.collectionId}/indexes`, 'POST', {
            key: index.key,
            type: index.type,
            attributes: index.attributes,
        });
        console.log(`Index '${index.key}' on '${index.collectionId}' created.`);
      } catch(e) {
        if (e.message.includes('index_already_exists')) {
            console.log(`Index '${index.key}' already exists, skipping.`);
        } else {
            console.error(`Failed to create index ${index.key}:`, e.message);
        }
      }
  }

  // 4. Create Storage Buckets
  console.log('\n--- Creating Storage Buckets ---');
  for (const bucket of buckets) {
      try {
        await apiRequest('/storage/buckets', 'POST', {
            bucketId: bucket.id,
            name: bucket.name,
            permissions: bucket.permissions,
            ...bucket.options,
        });
        console.log(`Bucket '${bucket.name}' created.`);
      } catch(e) {
        if (e.message.includes('bucket_already_exists')) {
            console.log(`Bucket '${bucket.name}' already exists, skipping.`);
        } else {
            console.error(`Failed to create bucket ${bucket.name}:`, e.message);
        }
      }
  }

  // 5. Generate Access Codes
  console.log('\n--- Generating 50 Access Codes ---');
  const codes = [];
  for (let i = 0; i < 50; i++) {
      const code = `PEERSPARK-${require('crypto').randomBytes(2).toString('hex').toUpperCase()}-${require('crypto').randomBytes(2).toString('hex').toUpperCase()}`;
      try {
          await apiRequest(`/databases/${DATABASE_ID}/collections/access_codes/documents`, 'POST', {
              documentId: 'unique()',
              data: { code: code, isClaimed: false },
          });
          codes.push(code);
          console.log(`✅ Created code #${i+1}: ${code}`);
      } catch (e) {
          console.error(`❌ Failed to create code #${i+1}: ${code}`);
      }
  }

  console.log('\n✅ Appwrite setup and code generation complete!');
  console.log('\n--- Generated Access Codes ---');
  console.log(codes.join('\n'));
}

setup().catch((e) => {
  console.error('\n❌ An unexpected error occurred during setup:');
  console.error(e);
  process.exit(1);
});
