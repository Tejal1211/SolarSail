import mongoose from 'mongoose';

const carbonTrackingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'transportation',
        'electricity',
        'water',
        'food',
        'waste',
        'shopping',
        'heating',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    activity: {
      type: String,
      required: [true, 'Activity description is required'],
      maxlength: [200, 'Activity description must not exceed 200 characters'],
    },
    carbonSaved: {
      type: Number,
      required: [true, 'Carbon saved amount is required'],
      min: [0, 'Carbon saved cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'lbs'],
      default: 'kg',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes must not exceed 500 characters'],
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
    indexes: [{ userId: 1, date: -1 }, { category: 1 }],
  }
);

/**
 * Aggregate monthly carbon savings
 */
carbonTrackingSchema.statics.getMonthlySavings = async function (userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$carbonSaved' },
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Get yearly statistics
 */
carbonTrackingSchema.statics.getYearlySavings = async function (userId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        total: { $sum: '$carbonSaved' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);
};

export default mongoose.model('CarbonTracking', carbonTrackingSchema);
