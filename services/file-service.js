export function getFilename(mimetype, contentType, username) {
	let fileExtension = null;

	if (mimetype === 'image/jpeg') {
		fileExtension = 'jpg';
	} else if (mimetype === 'image/png') {
		fileExtension = 'png';
	} else {
		return res.status(400).send('Unsupported file format.');
	}

	return `${username}-${contentType}-${Date.now()}.${fileExtension}`;
}
