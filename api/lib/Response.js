const Enum = require("../config/Enum");
const CustomError = require("./Error");

class Response {
    constructor() { }
    static successResponse(data, message = "Success", status = 200) {
        return { status, data, message }
    }
    static errorResponse(error) {
        console.error(error);
        if (error instanceof CustomError) {
            return { status: error.status, data: error.data, message: error.message };
        } else {
            return { status: Enum.HTTP_CODES.INT_SERVER_ERROR, data: null, message: "An unexpected error occurred" };
        }
    }

}

module.exports = Response;
