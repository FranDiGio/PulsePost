function timeSinceMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n)) return '';
  const seconds = Math.floor((Date.now() - n) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
}

function formatTimestamps(root = document) {
  root.querySelectorAll('.timestamp').forEach((element) => {
    const ms = element.getAttribute('data-ms') ?? element.textContent.trim();
    const pretty = timeSinceMs(ms);
    element.textContent = pretty || 'Invalid date';
  });
}

// Initial pass for SSR content
document.addEventListener('DOMContentLoaded', () => {
  formatTimestamps(document);
});

// Available for CSR content
window.formatTimestamps = formatTimestamps;
