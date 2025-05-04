# React POS System

## Important Security Note

This project uses Firebase for authentication and database services. The Firebase service account key (`serviceAccountKey.json`) contains sensitive credentials and should **never** be committed to a public repository.

### Managing Service Account Keys

1. The `serviceAccountKey.json` file has been added to `.gitignore` to prevent accidental commits.
2. If you clone this repository, you will need to obtain the `serviceAccountKey.json` file separately.
3. Place the `serviceAccountKey.json` file in the following locations:
   - `backend/functions/src/serviceAccountKey.json`
   - After building, it should also be copied to `backend/functions/lib/src/serviceAccountKey.json`

### Obtaining a Service Account Key

1. Go to the [Firebase console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project settings > Service accounts
4. Click "Generate new private key"
5. Save the file as `serviceAccountKey.json`

### Secure Alternative (For Production)

For production environments, consider using environment variables or Firebase environment configuration instead of storing the key in a file:

```javascript
// Example using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});
```

You can set these environment variables using Firebase Functions config:

```bash
firebase functions:config:set 
  firebase.project_id="your-project-id" 
  firebase.client_email="your-client-email" 
  firebase.private_key="your-private-key" 
  firebase.database_url="your-database-url"
  firebase.storage_bucket="your-storage-bucket"
```

And then access them in your code:

```javascript
const projectId = functions.config().firebase.project_id;
``` 