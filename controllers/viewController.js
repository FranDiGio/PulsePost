import { ref, get } from 'firebase/database'
import { db } from '../config/firebaseConfig.js'

export async function loadFeed(req, res) {
    try {
        const userRef = ref(db, `users/${req.session.userId}`)
        const userSnapshot = await get(userRef)
        const userData = userSnapshot.val()

        let profilePictureUrl

        if (userData && userData.profilePicture && userData.profilePicture !== 'N/A') {
            profilePictureUrl = userData.profilePicture
        } else {
            profilePictureUrl = '/images/default-profile.png'
        }

        res.render('feed.ejs', {
            username: req.session.username,
            profilePictureUrl: profilePictureUrl,
        })
    } catch (error) {
        console.error('Error fetching user data:', error)
        res.redirect('/login')
    }
}
