import { ref, push, update } from 'firebase/database'
import { db } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from '../services/dateService.js'

export async function submitPost(req, res) {
    const { title, content } = req.body
    const userId = req.session.userId
    const username = req.session.username

    const postData = {
        uid: userId,
        author: username,
        title: title,
        content: content,
        createdAt: getFormattedDateTime(),
    }

    // Create a new post reference with an automatically generated key
    const newPostRef = push(ref(db, 'posts'))
    const newPostId = newPostRef.key

    // Prepare updates to add the post in both 'posts' and 'users/{userId}/posts'
    const updates = {}
    updates[`/posts/${newPostId}`] = postData
    updates[`/users/${userId}/posts/${newPostId}`] = postData

    try {
        await update(ref(db), updates)
        res.redirect('/feed')
    } catch (error) {
        console.error('Error submitting post:', error)
        res.status(500).send('Error submitting post')
    }
}
