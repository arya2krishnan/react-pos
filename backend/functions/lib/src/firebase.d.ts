import * as admin from 'firebase-admin';
declare const db: admin.firestore.Firestore;
declare const storage: import("firebase-admin/lib/storage/storage").Storage;
declare const bucket: import("@google-cloud/storage/build/cjs/src/bucket").Bucket;
export { admin, db, storage, bucket };
