import { ref, push, update } from 'firebase/database';
import { db } from '../config/firebaseConfig.js';
import { getFormattedDateTime } from '../services/dateService.js';

export async function submitPost(req, res) {
	const { title, content } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	if (!title || !content) {
		return res.status(400).json({ errorCode: 'empty-fields', message: 'Title and content cannot be empty.' });
	}
	if (title.length > 100) {
		return res.status(400).json({ errorCode: 'title-too-long', message: 'Title cannot exceed 100 characters.' });
	}
	if (content.length > 1500) {
		return res
			.status(400)
			.json({ errorCode: 'content-too-long', message: 'Content cannot exceed 1500 characters.' });
	}

	// Replace multiple consecutive line breaks with a double line break
	let sanitizedContent = content.replace(/\n{3,}/g, '\n\n').trim();

	const postData = {
		uid: userId,
		author: username,
		title: title,
		content: sanitizedContent,
		createdAt: getFormattedDateTime(),
	};

	const newPostRef = push(ref(db, 'posts'));
	const newPostId = newPostRef.key;

	// Prepare updates to add the post in both 'posts' and 'users/{userId}/posts'
	const updates = {};
	updates[`/posts/${newPostId}`] = postData;
	updates[`/users/${userId}/posts/${newPostId}`] = postData;

	try {
		await update(ref(db), updates);
		res.redirect('/feed');
	} catch (error) {
		console.error('Error submitting post:', error);
		res.status(500).send('Error submitting post');
	}
}
