export class User {
    constructor (nickname, email, password){
        this.nickname = nickname;
        this.email = email;
        this.password = password;
    }

    toString() {
        return `Nickname: ${this.nickname},\nEmail: ${this.email},\nPassword: ${this.password}`;
    }
}
