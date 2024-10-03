import { ref, get } from 'firebase/database'
import { db } from '../config/firebaseConfig.js'

export async function loadFeed(req, res) {
    try {
        const profilePictureUrl = await getProfilePictureUrl(req.session.userId)
        const profileBackgroundUrl = await getProfileBackgroundUrl(req.session.userId)

        res.render('feed.ejs', {
            username: req.session.username,
            profilePictureUrl: profilePictureUrl,
            profileBackgroundUrl: profileBackgroundUrl,
        })
    } catch (error) {
        console.error('Error fetching user data:', error)
        res.redirect('/login')
    }
}

export async function loadProfile(req, res) {
    try {
        const profilePictureUrl = await getProfilePictureUrl(req.session.userId)
        const profileBackgroundUrl = await getProfileBackgroundUrl(req.session.userId)

        res.render('profile.ejs', {
            username: req.session.username,
            profilePictureUrl: profilePictureUrl,
            profileBackgroundUrl: profileBackgroundUrl,
        })
    } catch (error) {
        console.error('Error fetching user data:', error)
        res.redirect('/login')
    }
}

async function getProfilePictureUrl(userId) {
    try {
        const userRef = ref(db, `users/${userId}`)
        const userSnapshot = await get(userRef)
        const userData = userSnapshot.val()

        if (userData && userData.profilePicture && userData.profilePicture !== 'N/A') {
            return userData.profilePicture
        } else {
            return '/images/default-profile.png'
        }
    } catch (error) {
        console.error('Error fetching user data:', error)
        return '/images/default-profile.png'
    }
}

async function getProfileBackgroundUrl(userId) {
    try {
        const userRef = ref(db, `users/${userId}`)
        const userSnapshot = await get(userRef)
        const userData = userSnapshot.val()

        if (userData && userData.profileBackground && userData.profileBackground !== 'N/A') {
            return userData.profileBackground
        } else {
            return '/images/default-background.png'
        }
    } catch (error) {
        console.error('Error fetching user data:', error)
        return '/images/default-background.png'
    }
}
