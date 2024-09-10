import { db } from '../config/firebaseConfig.js';
import { getFormattedDateTime } from '../services/dateService.js';

export async function submitPost(req, res) {
    const { title, content } = req.body;
    const userId = req.session.userId;
    const username = req.session.username;

    const postData = {
        uid: userId,
        author: username,
        title: title,
        content: content,
        createdAt: getFormattedDateTime(),
    };

    const newPostRef = db.ref('posts').push();
    const newPostId = newPostRef.key;

    const updates = {};
    updates[`/posts/${newPostId}`] = postData;
    updates[`/users/${userId}/posts/${newPostId}`] = postData;

    try {
        await db.ref().update(updates);
        res.redirect('/feed');
    } catch (error) {
        console.error('Error submitting post:', error);
        res.status(500).send('Error submitting post');
    }
}
