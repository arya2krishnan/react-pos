import * as admin from 'firebase-admin';
import * as path from 'path';

// Use path.join to create a proper path that works after compilation
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: 'https://cafe-pos-gough.firebaseio.com',
    storageBucket: 'cafe-pos-gough.appspot.com'
});

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

export { admin, db, storage, bucket }; 