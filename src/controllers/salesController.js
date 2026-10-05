const Purchase = require('../models/Purchase');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get comprehensive sales summary and total sales per customer using MongoDB Aggregation
 * @route   GET /api/sales-summary
 * @access  Private (Owner ONLY - Enforced via role middleware)
 * @query   startDate, endDate, limit
 */
const getSalesSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 50 } = req.query;

  // Optional date filter for aggregation match stage
  const matchStage = { paymentStatus: 'paid' };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

  /**
   * Pipeline 1: Group by Customer to compute total sales per customer
   * Meets required objective: $group by customer, $sum purchases
   */
  const customerSalesPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$customer',
        totalSpent: { $sum: '$amount' },
        purchaseCount: { $sum: 1 },
        averageOrderValue: { $avg: '$amount' },
        firstPurchaseDate: { $min: '$date' },
        lastPurchaseDate: { $max: '$date' },
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerDetails',
      },
    },
    {
      $unwind: {
        path: '$customerDetails',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: 0,
        customerId: '$_id',
        customerName: '$customerDetails.name',
        customerEmail: '$customerDetails.email',
        customerCompany: '$customerDetails.company',
        customerTags: '$customerDetails.tags',
        customerStatus: '$customerDetails.status',
        totalSpent: { $round: ['$totalSpent', 2] },
        purchaseCount: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        firstPurchaseDate: 1,
        lastPurchaseDate: 1,
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limitNumber },
  ];

  /**
   * Pipeline 2: High-level Company Overview & Metrics using $facet
   */
  const overallMetricsPipeline = [
    { $match: matchStage },
    {
      $facet: {
        // Overall revenue and transaction totals
        overall: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              totalTransactions: { $sum: 1 },
              averageTransactionValue: { $avg: '$amount' },
              minTransaction: { $min: '$amount' },
              maxTransaction: { $max: '$amount' },
              uniqueCustomers: { $addToSet: '$customer' },
            },
          },
          {
            $project: {
              _id: 0,
              totalRevenue: { $round: ['$totalRevenue', 2] },
              totalTransactions: 1,
              averageTransactionValue: { $round: ['$averageTransactionValue', 2] },
              minTransaction: 1,
              maxTransaction: 1,
              payingCustomersCount: { $size: '$uniqueCustomers' },
            },
          },
        ],
        // Sales breakdown by payment method
        byPaymentMethod: [
          {
            $group: {
              _id: '$paymentMethod',
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              paymentMethod: '$_id',
              totalAmount: { $round: ['$totalAmount', 2] },
              transactionCount: 1,
            },
          },
          { $sort: { totalAmount: -1 } },
        ],
        // Monthly sales trends
        monthlyTrend: [
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
              },
              monthlyRevenue: { $sum: '$amount' },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              monthlyRevenue: { $round: ['$monthlyRevenue', 2] },
              orderCount: 1,
            },
          },
          { $sort: { year: -1, month: -1 } },
          { $limit: 12 },
        ],
      },
    },
  ];

  // Execute both aggregations concurrently
  const [perCustomerSales, [metricsResult]] = await Promise.all([
    Purchase.aggregate(customerSalesPipeline),
    Purchase.aggregate(overallMetricsPipeline),
  ]);

  const overview =
    metricsResult.overall.length > 0
      ? metricsResult.overall[0]
      : {
          totalRevenue: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          minTransaction: 0,
          maxTransaction: 0,
          payingCustomersCount: 0,
        };

  return ApiResponse.success(res, 'Sales summary generated successfully (Owner Access)', {
    overview,
    paymentMethodsBreakdown: metricsResult.byPaymentMethod,
    monthlyTrends: metricsResult.monthlyTrend,
    totalSalesPerCustomer: perCustomerSales,
    filtersApplied: {
      startDate: startDate || null,
      endDate: endDate || null,
      limit: limitNumber,
    },
  });
});

module.exports = {
  getSalesSummary,
};
