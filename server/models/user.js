import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  email: {
    type: String, unique: true, index: true, lowercase: true, required: true,
    validate: {
      validator: isEmail,
      message: '{VALUE} is not a valid email!'
    }
  },
  password: { type: String, required: true, minLength: 4, maxLength: 50 },
  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  passports: {
    type: [
      {
        providerName: { type: String, required: true, enum: ['facebook', 'google'] },
        thirdUserId: { type: String, required: true },
        profile: {},
      }
  ], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

export function genRandomPassword(length = 16) {
  return Math.random().toString(36).substr(2, length);
}

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (cb) {
        if (err) return cb(err);
        cb(null, isMatch);
      }
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

export default mongoose.model('User', userSchema);
