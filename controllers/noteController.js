const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

/* --->
    @desc Get all notes
    @root GET /notes
    @access Private
*/
const getAllNotes = asyncHandler(async (req, res) => {
	const notes = await Note.find().lean();
	res.json({ notes });
});

/* --->
    @desc Create all notes
    @root POST /notes
    @access Private
*/
const createNewNote = asyncHandler(async (req, res) => {
	const note = new Note(req.body);
	await note.save();
	res.json({ message: "Note created successfully!", note });
});

/* --->
    @desc Get  note details
    @root get /notes/<id>
    @access Private
*/
const getNoteDetails = asyncHandler(async (req, res) => {
	const note = await Note.findById(req.params.id);
	if (!note) return res.status(404).json({ message: "No item found!" });
	res.json({ note });
});

/* --->
    @desc Update all notes
    @root Patch /notes/<id>
    @access Private
*/
const updateNote = asyncHandler(async (req, res) => {
	const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	const updatedNote = await note.save();
	res.json({ message: "Note updated successfully!", note: updatedNote });
});

/* --->
    @desc Delete note
    @root Delete /notes/<id>
    @access Private
*/
const deleteNote = asyncHandler(async (req, res) => {
	const note = await Note.findByIdAndDelete(req.params.id);

	if (!note) {
		return res.status(404).json({ message: "No item found!" });
	}

	res.json({ message: "Note deleted successfully!", note });
});

module.exports = {
	getAllNotes,
	createNewNote,
	getNoteDetails,
	updateNote,
	deleteNote,
};
