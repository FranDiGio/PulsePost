export class User {
    constructor (nickname, email, password){
        this.nickname = nickname;
        this.email = email;
        this.password = password;
        this.posts = []
    }

    addPost(post) {
        this.posts.push(post)
    }

    deletePost() {
        // Logic for post deletion (still missing postID to do it)
    }

    toString() {
        return `Nickname: ${this.nickname},\nEmail: ${this.email},\nPassword: ${this.password}`;
    }
}
