const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
	logEvents(
		`${err.name}\t${err.message}\t${err.method}\t${err.url}\t${err?.headers?.origin}`,
		"errLog.log"
	);
	// console.log(err.stack);

	const status = res.statusCode ? res.statusCode : 500;
	res.status(status);

	res.json({ success: false, message: err.message });
};

module.exports = errorHandler;
