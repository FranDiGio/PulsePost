const previewPicture = document.getElementById('previewPicture')
const fileInput = document.getElementById('profilePicInput')
const originalPictureSource = previewPicture.src
var file = null

document.getElementById('triggerFileInput').addEventListener('click', function (event) {
    event.preventDefault()
    fileInput.value = null
    fileInput.click()
})

document.getElementById('profilePicForm').addEventListener('change', function (e) {
    e.preventDefault()
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

    document.querySelector('#submitFileInput > p').classList.add('d-none')
    document.querySelector('#submitFileInput > span').classList.remove('d-none')

    if (file) {
        const formData = new FormData()
        formData.append('profilePic', file)

        fetch('/upload/profile/picture', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                console.log('File uploaded successfully')

                // Clear input file
                fileInput.value = null
                file = null
                previewPicture.src = originalPictureSource

                // Close modal
                const pictureModal = bootstrap.Modal.getInstance(document.getElementById('pictureModal'))
                pictureModal.hide()
                window.location.reload()
            })
            .catch((error) => {
                console.error('Error uploading file:', error)
            })
            .finally(() => {
                document.querySelector('#submitFileInput > p').classList.remove('d-none')
                document.querySelector('#submitFileInput > span').classList.add('d-none')
            })
    }
})

document.getElementById('backButton').addEventListener('click', function () {
    fileInput.value = null
    file = null
    previewPicture.src = originalPictureSource
})
