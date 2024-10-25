const express = require('express');
const router = express.Router();
const Note = require('../db/models/Note');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const AuditLogs = require('../lib/AuditLogs');

router.get('/get-notes', async (req, res, next) => {
    try {
        let notes = await Note.find({});

        notes = notes.map(note => ({
            noteId: note.noteId,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }));

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
            content: body.content
        });

        await note.save();

        AuditLogs.info(req.user?.email, "notes", "Create", note);

        res.json(Response.successResponse(note, "Note saved successfully"));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/update', async (req, res) => {
    let body = req.body;

    try {
        if (!body.noteId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! noteId field must be filled!");
        }

        let updates = {};
        if (body.title) updates.title = body.title;
        if (body.content) updates.content = body.content;

        const updatedNote = await Note.findOneAndUpdate({ noteId: body.noteId }, updates, { new: true });

        if (!updatedNote) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "Note not found!");
        }

        AuditLogs.info(req.user?.email, "notes", "Update", { noteId: body.noteId, ...updates });

        res.json(Response.successResponse(updatedNote, "Note updated successfully"));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/delete', async (req, res) => {
    let body = req.body;

    try {
        if (!body.noteIds || !Array.isArray(body.noteIds) || body.noteIds.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! noteIds field must be a non-empty array!");
        }

        const noteIds = body.noteIds
            .map(id => Number(id))
            .filter(id => !isNaN(id));
        if (noteIds.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! All noteIds are invalid!");
        }

        const deletePromises = noteIds.map(noteId => Note.findOneAndDelete({ noteId }));
        const deletedNotes = await Promise.all(deletePromises);

        const notFoundNotes = deletedNotes.filter(note => !note);

        if (notFoundNotes.length > 0) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "Some notes were not found!");
        }

        AuditLogs.info(req.user?.email, "notes", "Delete", { noteIds: body.noteIds });

        res.json(Response.successResponse(`${body.noteIds.length} notes deleted successfully`));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
    }
});


module.exports = router;
