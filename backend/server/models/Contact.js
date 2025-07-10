import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  lastMessageAt: {
    type: Date
  },
  optedOut: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

contactSchema.index({ phone: 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ status: 1 });

export default mongoose.model('Contact', contactSchema);