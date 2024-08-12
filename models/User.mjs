export class User {
    constructor(username, email, password) {
        this.username = username
        this.email = email
        this.password = password
        this.posts = []
    }

    addPost(post) {
        this.posts.push(post)
    }

    deletePost() {
        // Logic for post deletion (still missing postID to do it)
    }

    toString() {
        return `Username: ${this.username},\nEmail: ${this.email},\nPassword: ${this.password}`
    }
}
