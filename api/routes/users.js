const express = require('express');
const router = express.Router();
const User = require('../db/models/User');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const bcrypt = require('bcrypt');
const validator = require('validator');
const AuditLogs = require('../lib/AuditLogs');

router.get('/get', async (req, res) => {
  try {
    let users = await User.find({});

    users = users.map(user => ({
      userId: user.userId,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json(Response.successResponse(users));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});

router.post('/create', async (req, res) => {
  let body = req.body;

  try {
    if (!body.username || !body.email || !body.password) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! All fields (username, email, password) must be filled!");
    }

    if (!validator.isEmail(body.email)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! Invalid email format!");
    }

    let user = new User({
      username: body.username,
      email: body.email,
      password: body.password
    });

    await user.save();

    AuditLogs.info(req.user?.email, "users", "Create", user);

    res.json(Response.successResponse({
      userId: user.userId,
      username: user.username,
      email: user.email
    }, "User created successfully"));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});

router.post('/update', async (req, res) => {
  let body = req.body;

  try {
    if (!body.userId) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! userId field must be filled!");
    }

    let updates = {};
    if (body.username) updates.username = body.username;
    if (body.email) {
      if (!validator.isEmail(body.email)) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! Invalid email format!");
      }
      updates.email = body.email;
    }
    if (body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate({ userId: body.userId }, updates, { new: true });

    if (!updatedUser) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "User not found!");
    }

    AuditLogs.info(req.user?.email, "users", "Update", { userId: body.userId, ...updates });

    res.json(Response.successResponse({
      userId: updatedUser.userId,
      username: updatedUser.username,
      email: updatedUser.email
    }, "User updated successfully"));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});

router.post('/delete', async (req, res) => {
  let body = req.body;

  try {
    if (!body.userId) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Error! userId field must be filled!");
    }

    const deletedUser = await User.findOneAndDelete({ userId: body.userId });

    if (!deletedUser) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "User not found!");
    }


    AuditLogs.info(req.user?.email, "users", "Delete", { userId: body.userId });

    res.json(Response.successResponse("User deleted successfully"));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});

module.exports = router;
