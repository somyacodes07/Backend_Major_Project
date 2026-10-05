const Purchase = require('../models/Purchase');
const Customer = require('../models/Customer');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Helper to generate a unique invoice number if not provided
 */
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * @desc    Record a purchase for a customer
 * @route   POST /api/customers/:id/purchases
 * @access  Private (Staff, Owner)
 */
const recordPurchase = asyncHandler(async (req, res) => {
  const { id: customerId } = req.params;
  const { amount, items, invoiceNumber, paymentMethod, paymentStatus, date, notes } = req.body;

  // Check customer existence
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${customerId}' not found.`);
  }

  const invoice = invoiceNumber || generateInvoiceNumber();

  // Check if invoice number is unique
  const existingInvoice = await Purchase.findOne({ invoiceNumber: invoice });
  if (existingInvoice) {
    throw ApiError.conflict(`An invoice with number '${invoice}' already exists.`);
  }

  const purchase = await Purchase.create({
    customer: customerId,
    amount,
    items: items || [],
    invoiceNumber: invoice,
    paymentMethod: paymentMethod || 'bank_transfer',
    paymentStatus: paymentStatus || 'paid',
    date: date ? new Date(date) : new Date(),
    recordedBy: req.user._id,
    notes: notes || '',
  });

  await purchase.populate([
    { path: 'recordedBy', select: 'name email' },
    { path: 'customer', select: 'name email company' },
  ]);

  return ApiResponse.created(res, 'Purchase recorded successfully', { purchase });
});

/**
 * @desc    Get all purchases for a specific customer
 * @route   GET /api/customers/:id/purchases
 * @access  Private (Staff, Owner)
 */
const getCustomerPurchases = asyncHandler(async (req, res) => {
  const { id: customerId } = req.params;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${customerId}' not found.`);
  }

  const purchases = await Purchase.find({ customer: customerId })
    .populate('recordedBy', 'name email')
    .sort({ date: -1 });

  return ApiResponse.success(res, 'Purchases retrieved successfully', {
    total: purchases.length,
    customerId,
    purchases,
  });
});

/**
 * @desc    Get all purchases with pagination and filters
 * @route   GET /api/purchases
 * @access  Private (Staff, Owner)
 */
const getAllPurchases = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentMethod, page = 1, limit = 10 } = req.query;

  const query = {};
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [purchases, total] = await Promise.all([
    Purchase.find(query)
      .populate('customer', 'name email company')
      .populate('recordedBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum),
    Purchase.countDocuments(query),
  ]);

  return ApiResponse.success(res, 'Purchases retrieved successfully', {
    purchases,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

module.exports = {
  recordPurchase,
  getCustomerPurchases,
  getAllPurchases,
};
