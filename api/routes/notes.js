const express = require('express');
const router = express.Router();
const Note = require('../db/models/Note');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');

router.get('/get-notes', async (req, res, next) => {
    try {
        let notes = await Note.find({});
        res.json(Response.successResponse(notes));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/create', async (req, res) => {
    let body = req.body;

    try {
        if (!body.title) {
            body.title = "Untitled";
        }
        if (!body.content) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! Content field must be filled!");
        }

        let note = new Note({
            title: body.title,
            content: body.content,
            createdBy: req.user?.id || null
        });
        await note.save();
        res.json(Response.successResponse(body, "Note saved successfully"));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/update', async (req, res) => {
    let body = req.body;

    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! _id field must be filled!");
        }

        let updates = {};
        if (body.title) updates.title = body.title;
        if (body.content) updates.content = body.content;


        const updatedNote = await Note.findByIdAndUpdate(body._id, updates, { new: true });

        if (!updatedNote) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "Note not found!");
        }

        res.json(Response.successResponse(updatedNote, "Note updated successfully"));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});


router.post('/delete', async (req, res) => {
    let body = req.body;

    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! _id field must be filled!");
        }

        const deletedNote = await Note.findByIdAndDelete(body._id);

        if (!deletedNote) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "Note not found!");
        }

        res.json(Response.successResponse("Note deleted successfully"));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;
