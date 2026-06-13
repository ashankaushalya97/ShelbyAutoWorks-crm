const Joi = require('joi');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const register = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password');
  const UserModel = mongoose.model(userModel);
  const { name, surname, email, password, country } = req.body;

  // validate
  const objectSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().optional(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().min(6).required(),
    country: Joi.string().optional(),
  });

  const { error, value } = objectSchema.validate({ name, surname, email, password, country });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email: email, removed: false });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'An account with this email already exists.',
    });
  }

  try {
    // Create new user
    const newUser = new UserModel({
      name,
      surname: surname || '',
      email,
      enabled: true,
      role: 'mechanic',
    });

    const savedUser = await newUser.save();

    // Create password with salt
    const salt = uniqueId();
    const newUserPassword = new UserPasswordModel();
    const passwordHash = newUserPassword.generateHash(salt, password);

    // Save password
    const userPasswordData = {
      password: passwordHash,
      emailVerified: true, // You might want to implement email verification later
      salt: salt,
      user: savedUser._id,
    };

    await new UserPasswordModel(userPasswordData).save();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Save token to logged sessions
    await UserPasswordModel.findOneAndUpdate(
      { user: savedUser._id },
      { $push: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();

    res.status(201).json({
      success: true,
      result: {
        _id: savedUser._id,
        name: savedUser.name,
        surname: savedUser.surname,
        role: savedUser.role,
        email: savedUser.email,
        token: token,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'An error occurred during registration.',
    });
  }
};

module.exports = register; 