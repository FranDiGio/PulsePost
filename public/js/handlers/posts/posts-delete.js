(() => {
  let postIdToDelete = null;

  // Delegate click
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.delete-post-link');
    if (!link) return;

    e.preventDefault();
    postIdToDelete = link.dataset.key || null;
  });

  const confirmBtn = document.getElementById('confirmDeletePostButton');
  if (!confirmBtn) return;

  const modalEl = document.getElementById('confirmDeletePostModal');
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      postIdToDelete = null;
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<p class="m-0 p-0">Confirm</p>';
    });
  }

  confirmBtn.addEventListener('click', async () => {
    if (!postIdToDelete) return;

    try {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

      const res = await fetch('/post', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ postId: postIdToDelete }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Delete failed:', payload);
        alert(payload?.error || 'Failed to delete the post.');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<p class="m-0 p-0">Confirm</p>';
        return;
      }

      window.location.reload();

    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Network error. Please try again.');
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<p class="m-0 p-0">Confirm</p>';
    }
  });
})();
