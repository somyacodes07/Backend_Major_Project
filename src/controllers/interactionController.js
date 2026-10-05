const Interaction = require('../models/Interaction');
const Customer = require('../models/Customer');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Log a new interaction for a customer
 * @route   POST /api/customers/:id/interactions
 * @access  Private (Staff, Owner)
 */
const logInteraction = asyncHandler(async (req, res) => {
  const { id: customerId } = req.params;
  const { type, summary, details, date, outcome } = req.body;

  // Verify customer exists
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${customerId}' not found.`);
  }

  const interactionDate = date ? new Date(date) : new Date();

  const interaction = await Interaction.create({
    customer: customerId,
    staff: req.user._id,
    type,
    summary,
    details: details || '',
    date: interactionDate,
    outcome: outcome || 'completed',
  });

  // Explicitly update lastContactDate on the customer model as well
  customer.lastContactDate = interactionDate;
  await customer.save();

  // Populate staff details
  await interaction.populate('staff', 'name email role');

  return ApiResponse.created(res, 'Interaction logged successfully', { interaction });
});

/**
 * @desc    Get all interactions for a specific customer
 * @route   GET /api/customers/:id/interactions
 * @access  Private (Staff, Owner)
 */
const getCustomerInteractions = asyncHandler(async (req, res) => {
  const { id: customerId } = req.params;
  const { type, outcome, sort = '-date' } = req.query;

  // Verify customer exists
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw ApiError.notFound(`Customer with ID '${customerId}' not found.`);
  }

  const query = { customer: customerId };
  if (type) query.type = type;
  if (outcome) query.outcome = outcome;

  let sortOption = {};
  if (sort.startsWith('-')) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  const interactions = await Interaction.find(query)
    .populate('staff', 'name email role')
    .sort(sortOption);

  return ApiResponse.success(res, 'Interactions retrieved successfully', {
    total: interactions.length,
    customerId,
    interactions,
  });
});

/**
 * @desc    Delete an interaction
 * @route   DELETE /api/interactions/:id
 * @access  Private (Staff, Owner)
 */
const deleteInteraction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interaction = await Interaction.findById(id);
  if (!interaction) {
    throw ApiError.notFound(`Interaction with ID '${id}' not found.`);
  }

  const customerId = interaction.customer;
  await interaction.deleteOne();

  // Find the latest remaining interaction to update customer's lastContactDate
  const latestInteraction = await Interaction.findOne({ customer: customerId }).sort({ date: -1 });
  await Customer.findByIdAndUpdate(customerId, {
    lastContactDate: latestInteraction ? latestInteraction.date : null,
  });

  return ApiResponse.success(res, 'Interaction deleted successfully', {
    deletedId: id,
  });
});

module.exports = {
  logInteraction,
  getCustomerInteractions,
  deleteInteraction,
};
