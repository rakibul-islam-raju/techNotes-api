const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

/* --->
    @desc Get all users
    @root GET /users
    @access Private
*/
const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().lean();
	res.json({ users });
});

/* --->
    @desc Create new user
    @root POST /users
    @access Private
*/
const createNewUser = asyncHandler(async (req, res) => {
	const { username, password, roles } = req.body;

	// hash password
	const hashedPass = await bcrypt.hash(password, 10);
	const userData = { username, password: hashedPass, roles };

	const newUser = new User(userData);

	if (!newUser) {
		res.status(400).json({ success: false, message: "Invalid user data!" });
	} else {
		await newUser.save();
		delete newUser.password;
		res.status(201).json({
			success: true,
			message: "User successfully created!",
			user: newUser,
		});
	}
});

/* --->
    @desc GET a user details
    @root GET /users
    @access Private
*/
const getUserDetails = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	const user = await User.findById(userId).exec();
	if (!user) {
		return res.status(404).json({ message: "User not found!" });
	}

	res.status(200).json({ user });
});

/* --->
    @desc Update a user
    @root Update /users
    @access Private
*/
const updateUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { roles, active } = req.body;

	const user = await User.findById(userId).exec();
	if (!user) {
		return res.status(404).json({ message: "User not found!" });
	}

	user.roles = roles ?? user.roles;
	user.active = active ?? user.active;
	const updatedUser = await user.save();

	res
		.status(200)
		.json({ message: "User successfully updated!", user: updatedUser });
});

/* --->
    @desc Delete a user
    @root Delete /users
    @access Private
*/
const deleteUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	// check if user exists
	const user = await User.findById(userId).exec();
	if (!user) {
		return res.status(404).json({ message: "User not found!" });
	}

	// check if user has any notes
	const notes = await Note.find({ user: userId });
	// delete notes
	if (notes.length) await notes.deleteMany();
	// delete user
	const result = await user.deleteOne();
	res.json({ message: "User deleted successfully!", user: result });
});

module.exports = {
	getAllUsers,
	getUserDetails,
	createNewUser,
	updateUser,
	deleteUser,
};
