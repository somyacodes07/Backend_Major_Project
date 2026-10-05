const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Purchase amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    items: {
      type: [purchaseItemSchema],
      default: [],
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['credit_card', 'bank_transfer', 'cash', 'upi', 'stripe', 'paypal'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'bank_transfer',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Post-save hook to update customer's aggregate stats
purchaseSchema.post('save', async function (doc) {
  try {
    const Customer = mongoose.model('Customer');
    const Purchase = mongoose.model('Purchase');

    // Recalculate customer's total spent and purchase count
    const stats = await Purchase.aggregate([
      { $match: { customer: doc.customer, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$amount' },
          totalPurchases: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Customer.findByIdAndUpdate(doc.customer, {
        totalSpent: stats[0].totalSpent,
        totalPurchases: stats[0].totalPurchases,
      });
    }
  } catch (error) {
    console.error(`[Error] Failed to update customer purchase totals: ${error.message}`);
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
