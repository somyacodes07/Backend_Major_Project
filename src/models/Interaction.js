const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Interaction type is required'],
      enum: {
        values: ['call', 'email', 'meeting', 'message', 'note'],
        message: '{VALUE} is not a valid interaction type',
      },
    },
    summary: {
      type: String,
      required: [true, 'Interaction summary is required'],
      trim: true,
      maxlength: [200, 'Summary cannot exceed 200 characters'],
    },
    details: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    outcome: {
      type: String,
      enum: ['successful', 'follow_up_needed', 'no_answer', 'cancelled', 'completed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// After an interaction is logged, automatically update customer's lastContactDate
interactionSchema.post('save', async function (doc) {
  try {
    const Customer = mongoose.model('Customer');
    await Customer.findByIdAndUpdate(doc.customer, {
      lastContactDate: doc.date || new Date(),
    });
  } catch (error) {
    console.error(`[Error] Failed to update customer lastContactDate: ${error.message}`);
  }
});

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
