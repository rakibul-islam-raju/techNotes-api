const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.get("/", noteController.getAllNotes);
router.post("/", noteController.createNewNote);
router.get("/:id", noteController.getNoteDetails);
router.patch("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;
