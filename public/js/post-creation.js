// Character counter for content of post
const textarea = document.getElementById('postContent')
const charCount = document.getElementById('charCount')
const maxChars = textarea.getAttribute('maxlength')

textarea.addEventListener('input', () => {
    const remaining = maxChars - textarea.value.length
    charCount.textContent = remaining
})
