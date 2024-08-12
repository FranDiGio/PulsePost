export class Post {
    constructor(userID, title, content, timestamp) {
        this.userID = userID
        this.title = title
        this.content = content
        this.timestamp = timestamp
    }

    toString() {
        return `UserID: ${this.userID},\nTitle: ${this.title},\nContent: ${this.content},\nTimestamp: ${this.timestamp}`
    }
}
