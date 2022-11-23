const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const {
	ACCESS_TOKEN_EXPIRATION,
	REFRESH_TOKEN_EXPIRATION,
} = require("../config/constants");

function generateAccessOrRefreshToken(data, type = "access") {
	return jwt.sign(
		{ ...data },
		type === "access"
			? process.env.ACCESS_TOKEN_SECRET
			: process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn:
				type === "access" ? ACCESS_TOKEN_EXPIRATION : REFRESH_TOKEN_EXPIRATION,
		}
	);
}

/* --->
    @desc Post login
    @root GET /auth/login
    @access public
*/
const login = asyncHandler(async (req, res) => {
	const { username, password } = req.body;

	if (!username)
		return res
			.status(400)
			.json({ success: false, message: "Username is required!" });

	if (!password)
		return res
			.status(400)
			.json({ success: false, message: "Password required!" });

	const user = await User.findOne({ username })
		.select("username roles password")
		.exec();

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

	console.log("user=>", user);
	const userInfo = { username: user.username, roles: user.roles };
	console.log("userInfo=>", userInfo);

	const accessToken = generateAccessOrRefreshToken(userInfo, "access");
	const refreshToken = generateAccessOrRefreshToken(userInfo, "refresh");

	res.cookie("jwt", refreshToken, {
		httpOnly: true, // only accessible by web servers
		secure: true, // https
		sameSite: "none", // cross-site cookie
		maxAge: 7 * 24 * 60 * 60 * 100,
	});

	res.status(200).json({ success: true, accessToken, refreshToken });
});

/* --->
    @desc Post refresh token
    @root GET /auth/refresh
    @access public
*/
const refresh = (req, res) => {
	const cookies = req.cookies;
	console.log("cookies =>", cookies);
	if (!cookies?.jwt)
		return res.status(401).json({ success: false, message: "Unauthorized!" });

	const refreshToken = cookies.jwt;

	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		asyncHandler(async (err, decoded) => {
			if (err) {
				console.log("err =>", err);
				return res.status(403).json({ success: false, message: "Forbidden!" });
			}
			console.log("decoded =>", decoded);
			const user = await User.findOne({ username: decoded.username });
			console.log("user =>", user);
			if (!user)
				return res
					.status(401)
					.json({ success: false, message: "Unauthorized!" });

			const accessToken = generateAccessOrRefreshToken(
				{
					username: user.username,
					roles: user.roles,
				},
				"access"
			);

			res.status(200).json({ success: true, accessToken });
		})
	);
};

/* --->
    @desc Post logout
    @root GET /auth/logout
    @access public
*/
const logout = asyncHandler(async (req, res) => {
	const cookies = req.cookies;
	console.log("2 ==", cookies);
	if (!cookies?.jwt) return res.sendStatus(204);
	res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
	res.json({ message: "Cookie cleared" });
});

module.exports = {
	login,
	refresh,
	logout,
};
