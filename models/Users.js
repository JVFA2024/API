
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  description: { type: String, required: true }
});


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 0 }, // Added account balance with a default of 0
  accountNumber: { type: String, required: true, unique: true },
  transactions: [transactionSchema]
});


// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);