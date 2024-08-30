import { ref, child, push, update } from 'firebase/database'
import { db } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from './dateService.js'

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

    const newPostId = push(child(ref(db), 'posts')).key

    // Prefer using update instead of set to keep consistency if any operation were to fail
    const updates = {}
    updates['/posts/' + newPostId] = postData
    updates['/users/' + userId + '/posts/' + newPostId] = postData

    update(ref(db), updates)
    res.redirect('/feed')
}
