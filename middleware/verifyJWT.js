const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader) {
		return res.status(401).json({ success: false, message: "Unathorized!" });
	}

	const token = authHeader.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err)
			return res
				.status(403)
				.message({ success: false, messsage: "Forbidden!" });
		req.user = decoded.userInfo.username;
		req.roles = decoded.userInfo.roles;
	});
};

module.exports = verifyJWT;
