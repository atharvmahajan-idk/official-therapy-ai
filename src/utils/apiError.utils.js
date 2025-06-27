class ApiError extends Error {
    constructor(message, statusCode = 500, source) {
        super(message);
        this.message = message;
        this.source = source; // Optional source of the error, e.g., 'Database',
        this.statusCode = statusCode;
    }
}
export {ApiError}