class UserValidationResult {
	constructor() {
		this.invalidFields = {
			invalidUsername: false,
			invalidEmail: false,
			invalidPassword: false,
		};
		this.invalidMessages = {
			invalidUsernameMsg: '',
			invalidEmailMsg: '',
			invalidPasswordMsg: '',
		};
	}

	setInvalid(field, message) {
		this.invalidFields[`invalid${field}`] = true;
		this.invalidMessages[`invalid${field}Msg`] = message;
	}
}

export default UserValidationResult;
