import * as admin from 'firebase-admin';

// Initialize without service account for production deployment
// The application will use the default credentials provided by the runtime
admin.initializeApp();

// Configure Firestore to ignore undefined values
const db = admin.firestore();
db.settings({
    ignoreUndefinedProperties: true
});

const storage = admin.storage();

// Use the exact bucket URL provided by the user with gs:// protocol
const customBucketName = 'cafe-pos-gough.firebasestorage.app';
// The bucket name needs to match the user's format: gs://cafe-pos-gough.firebasestorage.app
const bucket = storage.bucket(customBucketName);

// Also create alternate bucket references to try if the first one fails
const alternativeBuckets = {
    withGsProtocol: storage.bucket(`gs://${customBucketName}`),
    appspotFormat: storage.bucket('cafe-pos-gough.appspot.com')
};

console.log('Using Firebase Storage bucket:', customBucketName);
console.log('Alternative bucket formats available if needed');

export { admin, db, storage, bucket, alternativeBuckets }; 