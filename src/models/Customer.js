const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [120, 'Customer name cannot exceed 120 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: ['Lead'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['lead', 'prospect', 'active', 'inactive'],
        message: '{VALUE} is not a valid customer status',
      },
      default: 'lead',
      index: true,
    },
    lastContactDate: {
      type: Date,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for customer interactions
customerSchema.virtual('interactions', {
  ref: 'Interaction',
  localField: '_id',
  foreignField: 'customer',
});

// Virtual field for customer purchases
customerSchema.virtual('purchases', {
  ref: 'Purchase',
  localField: '_id',
  foreignField: 'customer',
});

// Compound index for search performance
customerSchema.index({ name: 'text', email: 'text', company: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
