import { db, bucket } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from '../services/dateService.js'

export async function uploadProfilePicture(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded.')
    }

    const file = bucket.file(`profile_pictures/${req.session.userId}/${req.file.originalname}`)
    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
        },
    })

    stream.on('error', (error) => {
        console.error('Error uploading file:', error)
        res.status(500).send('Error uploading file')
    })

    stream.on('finish', async () => {
        await file.makePublic()

        const downloadUrl = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        })

        db.ref(`users/${req.session.userId}`).update({
            profilePicture: downloadUrl[0],
        })

        res.status(200).send('File uploaded successfully')
    })

    stream.end(req.file.buffer)
}
