(() => {
  const CHAR_LIMIT = 700;
  const BR_LIMIT = 6;

  function computeTruncatedHTML(fullHTML) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHTML;

    let charCount = 0;
    let brCount = 0;
    let out = '';

    for (const node of tempDiv.childNodes) {
      const nodeHTML = node.outerHTML || node.textContent || '';
      const nodeText = node.textContent || '';
      const nodeBreaks =
        (nodeText.match(/\n/g) || []).length +
        (nodeHTML.match(/<br\s*\/?>/gi) || []).length;

      const wouldExceedChars = charCount + nodeText.length > CHAR_LIMIT;
      const wouldExceedBreaks = brCount + nodeBreaks > BR_LIMIT;

      if (wouldExceedChars || wouldExceedBreaks) {
        if (out === '' && nodeText) {
          const remainingChars = Math.max(0, CHAR_LIMIT - charCount);
          const remainingBreaks = Math.max(0, BR_LIMIT - brCount);

          let snippet = nodeText.slice(0, remainingChars);
          const lines = snippet.split('\n');
          if (lines.length > remainingBreaks) {
            snippet = lines.slice(0, remainingBreaks).join('\n');
          }
          out += snippet.replace(/\n/g, '<br>');
        }
        break;
      }

      charCount += nodeText.length;
      brCount += nodeBreaks;
      out += nodeHTML;
    }

    return out.trimEnd() + '<span class="ellipsis">...</span>';
  }

  function processOne(section) {
    const content = section.querySelector('.post-content');
    const btn = section.querySelector('.read-more-btn');
    if (!content || !btn) return;

    // Avoid double-processing
    if (content.dataset.truncateProcessed === '1') return;

    const fullHTML = content.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHTML;

    const textLen = tempDiv.textContent.length;
    const brs = (fullHTML.match(/<br\s*\/?>/gi) || []).length + (tempDiv.textContent.match(/\n/g) || []).length;

    const needsTrunc = textLen > CHAR_LIMIT || brs > BR_LIMIT;

    if (needsTrunc) {
      const truncated = computeTruncatedHTML(fullHTML);
      content.innerHTML = truncated;
      content.setAttribute('data-full-text', fullHTML);
      btn.style.display = 'inline';
    } else {
      btn.style.display = 'none';
    }

    content.dataset.truncateProcessed = '1';
  }

  function truncatePostContents(root = document) {
    root.querySelectorAll('.post-section').forEach(processOne);
  }

  // Delegated click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.read-more-btn');
    if (!btn) return;

    const section = btn.closest('.post-section');
    const content = section?.querySelector('.post-content');
    if (!content) return;

    const full = content.getAttribute('data-full-text');
    if (btn.textContent.trim() === 'Show more') {
      // Expand
      if (full) {
        content.innerHTML = full;
        btn.textContent = 'Show less';
      }
    } else {
      // Collapse
      const fullHTML = full || content.innerHTML;
      const truncated = computeTruncatedHTML(fullHTML);
      content.innerHTML = truncated;
      if (!full) content.setAttribute('data-full-text', fullHTML);
      btn.textContent = 'Show more';
    }
  });

  // Initial pass for SSR
  document.addEventListener('DOMContentLoaded', () => {
    truncatePostContents(document);
  });

  // Expose for CSR
  window.truncatePostContents = truncatePostContents;
})();
