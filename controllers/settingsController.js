import { ref, child, push, update } from 'firebase/database'
import { db, storage } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from '../services/dateService.js'

export async function uploadProfilePicture(req, res) {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const storageRef = ref(storage, `profilePictures/${file.originalname}`);

        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file.buffer)
        console.log('Uploaded a file:', snapshot)

        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('Download URL:', downloadURL)

        // Update Realtime Database with the picture URL
        const userId = req.session.userId
        const userRef = ref(db, `users/${userId}`);

        await update(userRef, {
            profilePicture: downloadURL
        });

        console.log('Updated profile picture URL in Realtime Database for user:', userId);

        res.status(200).json({
            message: 'File uploaded and URL saved successfully!',
            downloadURL
        });
    } catch (error) {
        console.error('Error uploading file or updating database:', error);
        res.status(500).send('Internal server error.');
    }
}