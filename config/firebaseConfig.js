import dotenv from 'dotenv'
import admin from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }

dotenv.config()

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
})

const db = admin.database()
const auth = admin.auth()
const bucket = admin.storage().bucket()

export { db, auth, bucket }
