const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: 6
  },
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  fcmToken: {
    type: String,
    default: ''
  },
  settings: {
    alertDays: {
      type: [Number],
      default: [30, 14, 7, 3, 1]
    },
    notificationTime: {
      type: String,
      default: '08:00'
    },
    pushEnabled: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't expose password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

