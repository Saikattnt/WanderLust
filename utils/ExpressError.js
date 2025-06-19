class ExpressError extends Error {  //js have built in Error class,we are extending the Error class to create our own custom error class
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError