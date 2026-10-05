const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

/**
 * @desc    Register a new user (Staff or Owner)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // If this is the very first user in the database, promote to owner automatically
  const userCount = await User.countDocuments();
  const assignedRole = userCount === 0 ? ROLES.OWNER : role || ROLES.STAFF;

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    phone,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return ApiResponse.created(res, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
    token,
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since it has select: false in schema
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact your manager.');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = generateToken({ id: user._id, role: user.role });

  return ApiResponse.success(res, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
    token,
  });
});

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Owner, Staff)
 */
const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'User profile retrieved successfully', {
    user: req.user,
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const { name, phone, password } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password; // Will trigger pre-save hash

  await user.save();

  return ApiResponse.success(res, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      updatedAt: user.updatedAt,
    },
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
