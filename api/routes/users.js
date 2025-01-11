const express = require('express');
const router = express.Router();
const User = require('../db/models/User');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');

const validator = require('validator');
const AuditLogs = require('../lib/AuditLogs');
const config = require('../config');
const jwt = require('jwt-simple');

const auth = require("../lib/auth");
const TokenBlacklist = require('../db/models/TokenBlacklist');



router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "All fields (username, email, password) must be provided!");
    }

    if (!validator.isEmail(email)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "Invalid email format!");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "A user with this email already exists!");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, [], "A user with this username already exists!");
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    const payload = {
      id: newUser.id,
      exp: Math.floor(Date.now() / 1000) + config.JWT.EXPIRE_TIME,
    };
    const token = jwt.encode(payload, config.JWT.SECRET);

    newUser.currentToken = token;
    await newUser.save();

    AuditLogs.info(email, "users", "Register", newUser);

    res.json(Response.successResponse({
      token,
      expires: config.JWT.EXPIRE_TIME,
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
      }
    }, "User registered successfully and logged in"));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    User.validateFieldsBeforeAuth(email, password);

    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, [], "Error! Wrong email or password!");
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, [], "Error! Wrong email or password!");
    }

    const payload = {
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + config.JWT.EXPIRE_TIME
    };
    const token = jwt.encode(payload, config.JWT.SECRET);

    user.currentToken = token;
    await user.save();

    res.json(Response.successResponse({
      token,
      expires: config.JWT.EXPIRE_TIME,
      user: { username: user.username }
    }, "Login successful"));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});


router.all("*", auth().authenticate()), async (req, res, next) => {
  next();
}

router.post('/logout', auth().authenticate(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, [], "User not found!");
    }

    const token = user.currentToken;

    if (token) {
      const blacklistedToken = new TokenBlacklist({ token });
      await blacklistedToken.save();

      user.currentToken = null;
      await user.save();
    }

    res.json(Response.successResponse("Logout successful"));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.status || Enum.HTTP_CODES.INT_SERVER_ERROR).json(errorResponse);
  }
});


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
      updates.password = body.password;
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
