const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { ACCESS_TOKEN_EXPIRATION } = require("../config/constants");

function generateAccessToken(data) {
	return jwt.sign(
		{
			userInfo: { ...data },
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: ACCESS_TOKEN_EXPIRATION }
	);
}

/* --->
    @desc Post login
    @root GET /auth/login
    @access public
*/
const login = asyncHandler(async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password)
		return res
			.status(400)
			.json({ success: false, message: "All fields are required!" });

	const user = await User.findOne({ username }).exec();

	if (!user)
		return res.status(401).json({ success: false, message: "User not found!" });

	if (!user && !user.active)
		return res
			.status(401)
			.json({ success: false, message: "User not authorized to login!" });

	const matchPass = await bcrypt.compare(password, user.password);
	if (!matchPass)
		return res
			.status(401)
			.json({ success: false, message: "Incorrent password!" });

	const accessToken = generateAccessToken({
		username: user.username,
		roles: user.roles,
	});

	const refreshToken = jwt.sign(
		{
			userInfo: {
				username: user.username,
			},
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "1d" }
	);

	res.cookie("jwt", refreshToken, {
		httpOnly: true, // only accessible by web servers
		secure: true, // https
		sameSite: "none", // cross-site cookie
		maxAge: 7 * 24 * 60 * 60 * 100,
	});

	res.status(200).json({ success: true, accessToken });
});

/* --->
    @desc Post refresh token
    @root GET /auth/refresh
    @access public
*/
const refresh = asyncHandler(async (req, res) => {
	const cookies = req.cookies;
	if (!cookies?.jwt)
		return res.status(401).json({ success: false, message: "Unauthorized!" });

	const refreshToken = cookies.jwt;

	jwt.verify(
		refreshToken,
		process.env.ACCESS_TOKEN_SECRET,
		asyncHandler(async (err, decoded) => {
			if (err)
				return res.status(403).json({ success: false, message: "Forbidden!" });
			const user = await User.findOne({ username: decoded.username });
			if (!user)
				return res
					.status(401)
					.json({ success: false, message: "Unauthorized!" });

			const accessToken = generateAccessToken({
				username: user.username,
				roles: user.roles,
			});

			res.status(200).json({ success: true, accessToken });
		})
	);
});

/* --->
    @desc Post logout
    @root GET /auth/logout
    @access public
*/
const logout = asyncHandler(async (req, res) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.status(204);
	res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
});

module.exports = {
	login,
	refresh,
	logout,
};
