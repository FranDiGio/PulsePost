const previewPicture = document.getElementById('previewPicture')
const originalPictureSource = previewPicture.src
var file = null

document.getElementById('triggerFileInput').addEventListener('click', function (event) {
    event.preventDefault()
    const fileInput = document.getElementById('profilePicInput')
    fileInput.value = null
    fileInput.click()
})

document.getElementById('profilePicForm').addEventListener('change', function (e) {
    e.preventDefault()
    const fileInput = document.getElementById('profilePicInput')
    file = null
    file = fileInput.files[0]

    if (file) {
        const reader = new FileReader()
        reader.onload = function () {
            previewPicture.src = reader.result
        }
        reader.readAsDataURL(file)
    } else {
        previewPicture.src = originalPictureSource
    }
})

document.getElementById('submitFileInput').addEventListener('click', function (event) {
    event.preventDefault()

    if (file) {
        const formData = new FormData()
        formData.append('profilePic', file)

        fetch('/upload/profile/picture', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                console.log('File uploaded successfully')
                fileInput.value = null
                window.location.reload()
            })
            .catch((error) => {
                console.error('Error uploading file:', error)
            })
    }
})

document.getElementById('pictureModal').addEventListener('hidden.bs.modal', function () {
    previewPicture.src = originalPictureSource
    file = null
})

document.querySelector('.modal-footer .btn-secondary').addEventListener('click', function () {
    previewPicture.src = originalPictureSource
    file = null
})
