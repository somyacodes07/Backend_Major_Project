const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const Purchase = require('../models/Purchase');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private (Staff, Owner)
 */
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, tags, status, notes } = req.body;

  // Check if customer with this email already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    throw ApiError.conflict(`A customer with email '${email}' already exists.`);
  }

  // Format tags array if passed as comma separated string
  let parsedTags = ['Lead'];
  if (tags) {
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  const customer = await Customer.create({
    name,
    email,
    phone: phone || '',
    company: company || '',
    tags: parsedTags,
    status: status || 'lead',
    notes: notes || '',
    createdBy: req.user._id,
  });

  return ApiResponse.created(res, 'Customer created successfully', { customer });
});

/**
 * @desc    Get customers with search, filtering, sorting and pagination
 * @route   GET /api/customers
 * @access  Private (Staff, Owner)
 * @query   search, tag, status, minLastContactDate, maxLastContactDate, sort, page, limit
 */
const getCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    tag,
    status,
    minLastContactDate,
    maxLastContactDate,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // 1. Search filter: Matches name, email, company, or phone
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
      { phone: searchRegex },
    ];
  }

  // 2. Tag filter (single tag or comma-separated tags)
  if (tag) {
    const tagList = tag.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length === 1) {
      query.tags = { $in: [new RegExp(`^${tagList[0]}$`, 'i')] };
    } else if (tagList.length > 1) {
      query.tags = { $in: tagList.map((t) => new RegExp(`^${t}$`, 'i')) };
    }
  }

  // 3. Status filter
  if (status) {
    query.status = status.toLowerCase();
  }

  // 4. Last Contact Date filtering
  if (minLastContactDate || maxLastContactDate) {
    query.lastContactDate = {};
    if (minLastContactDate) {
      query.lastContactDate.$gte = new Date(minLastContactDate);
    }
    if (maxLastContactDate) {
      query.lastContactDate.$lte = new Date(maxLastContactDate);
    }
  }

  // 5. Pagination setup
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // 6. Sorting setup (e.g. 'name:asc', 'lastContactDate:desc' or '-createdAt')
  let sortOption = {};
  if (sort.includes(':')) {
    const [field, direction] = sort.split(':');
    sortOption[field] = direction.toLowerCase() === 'asc' ? 1 : -1;
  } else if (sort.startsWith('-')) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  // Execute query and count in parallel
  const [customers, total] = await Promise.all([
    Customer.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Customer.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return ApiResponse.success(res, 'Customers retrieved successfully', {
    customers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    filters: {
      search: search || null,
      tag: tag || null,
      status: status || null,
      minLastContactDate: minLastContactDate || null,
      maxLastContactDate: maxLastContactDate || null,
      sort,
    },
  });
});

/**
 * @desc    Get single customer details by ID (including recent interactions & purchases)
 * @route   GET /api/customers/:id
 * @access  Private (Staff, Owner)
 */
const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id).populate('createdBy', 'name email role');
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${id}' not found.`);
  }

  // Fetch recent interactions and purchases for this customer
  const [interactions, purchases] = await Promise.all([
    Interaction.find({ customer: id })
      .populate('staff', 'name email role')
      .sort({ date: -1 })
      .limit(10),
    Purchase.find({ customer: id })
      .populate('recordedBy', 'name email')
      .sort({ date: -1 })
      .limit(10),
  ]);

  return ApiResponse.success(res, 'Customer details retrieved successfully', {
    customer,
    recentInteractions: interactions,
    recentPurchases: purchases,
  });
});

/**
 * @desc    Update a customer record
 * @route   PUT /api/customers/:id
 * @access  Private (Staff, Owner)
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, tags, status, notes } = req.body;

  const customer = await Customer.findById(id);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${id}' not found.`);
  }

  // Check email conflict if email changed
  if (email && email.toLowerCase() !== customer.email) {
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict(`Another customer with email '${email}' already exists.`);
    }
    customer.email = email.toLowerCase();
  }

  if (name) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (company !== undefined) customer.company = company;
  if (status) customer.status = status;
  if (notes !== undefined) customer.notes = notes;

  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      customer.tags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      customer.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  await customer.save();

  return ApiResponse.success(res, 'Customer updated successfully', { customer });
});

/**
 * @desc    Delete a customer and clean up related records
 * @route   DELETE /api/customers/:id
 * @access  Private (Staff, Owner)
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${id}' not found.`);
  }

  // Cascade delete interactions and purchases for data integrity
  await Promise.all([
    Customer.findByIdAndDelete(id),
    Interaction.deleteMany({ customer: id }),
    Purchase.deleteMany({ customer: id }),
  ]);

  return ApiResponse.success(res, 'Customer and all associated records deleted successfully', {
    deletedCustomerId: id,
  });
});

/**
 * @desc    Get quick customer statistics (distribution by status, top tags)
 * @route   GET /api/customers/stats/summary
 * @access  Private (Staff, Owner)
 */
const getCustomerStats = asyncHandler(async (req, res) => {
  const [statusDistribution, tagsAggregation, totalCustomers] = await Promise.all([
    Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
    Customer.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]),
    Customer.countDocuments(),
  ]);

  return ApiResponse.success(res, 'Customer statistics retrieved successfully', {
    totalCustomers,
    byStatus: statusDistribution,
    topTags: tagsAggregation,
  });
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
};
