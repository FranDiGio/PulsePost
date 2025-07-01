document.addEventListener('DOMContentLoaded', function () {

    // Like button interaction
    document.querySelectorAll('.like-button').forEach((button) => {
        button.addEventListener('click', async function () {
            const heartIcon = this.querySelector('.heart-icon');
            const postId = this.dataset.postId;
            const likeCountElement = this.closest('.d-flex').querySelector('.like-count');
            let currentCount = parseInt(likeCountElement.textContent, 10);

            // Toggle UI
            const isNowLiked = !heartIcon.classList.contains('filled');
            heartIcon.classList.toggle('filled');
            likeCountElement.textContent = isNowLiked ? currentCount + 1 : currentCount - 1;

            try {
                const res = await fetch(`/likes/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    console.error('Failed to toggle like');
                    // Revert the UI if server fails
                    heartIcon.classList.toggle('filled');
                }
            } catch (err) {
                console.error('Error sending like request:', err);
                // Revert the UI if there's an error
                heartIcon.classList.toggle('filled');
            }
        });
    });

});