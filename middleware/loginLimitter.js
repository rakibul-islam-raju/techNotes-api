const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimitter = rateLimit({
	windowMs: 60 * 100,
	max: 5,
	message: {
		message: "Too many login attempts! Please try again after 60 seconds.",
	},
	handler: (req, res, next, options) => {
		logEvents(
			`Too mant requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
			"errLog.log"
		);
	},
	standardHeaders: true, // return rate limit ingo in the 'RateLimi-*' headers
	legacyHeaders: false, //Disable the 'X-RateLimi-*' headers
});

module.exports = loginLimitter;
