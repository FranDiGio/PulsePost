import { db } from '../config/firebaseConfig.js'

export async function loadFeed(req, res) {
    try {
        const userSnapshot = await db.ref(`users/${req.session.userId}`).once('value')
        const userData = userSnapshot.val()

        const profilePictureUrl = userData.profilePicture || '/images/default-profile.png' // Fallback to a default image

        res.render('feed.ejs', {
            username: req.session.username,
            profilePictureUrl: profilePictureUrl,
        })
    } catch (error) {
        console.error('Error fetching user data:', error)
        res.redirect('/login')
    }
}
