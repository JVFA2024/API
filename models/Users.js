
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }
});

const spendingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }
});

const appointmentSchema = new mongoose.Schema({
  fullname: { type: String, required: true},
  nationalID: { type: Number, required: true },
  //accountNumber: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true},
  serviceType: { type: String, required: true },
  appointmentDate: { type: Date, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 0 },
  accountNumber: { type: String, required: true, unique: true },
  transactions: [transactionSchema],
  spendings: [spendingSchema],
  appointments: [appointmentSchema]  // Adding appointments array to the user model

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

