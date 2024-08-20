class CustomError extends Error {
    constructor(status, data, message) {
        super(message);

        this.status = status;
        this.data = data;
        this.message = message;
    }
}
module.exports = CustomError;