class PasswordValidationResult {
    constructor() {
        this.invalidFields = {
            invalidCurrentPassword: false,
            invalidNewPassword: false,
        };
        this.invalidMessages = {
            invalidCurrentPasswordMsg: '',
            invalidNewPasswordMsg: '',
        };
    }

    setInvalid(field, message) {
        this.invalidFields[`invalid${field}`] = true;
        this.invalidMessages[`invalid${field}Msg`] = message;
    }
}

export default PasswordValidationResult;
