import mongoose from "mongoose";
import bcrypt from "bcrypt";
import isEmail from "validator/lib/isEmail";
import _ from "lodash";

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      required: true,
      minLength: 4,
      maxLength: 30,
      validate: {
        validator: v => isEmail(v),
        message: "{VALUE} is not a valid email!"
      }
    },
    password: { type: String, required: true, minLength: 4, maxLength: 50 },
    displayName: { type: String },
    isActive: { type: Boolean },
    activeURL: { type: String },
    avatarURL: { type: String },
    profile: {
      lang: { type: String },
      country: { type: String },
      firstName: { type: String, minLength: 1 },
      lastName: { type: String, minLength: 1 },
      gender: { type: String },
      location: { type: String },
      birthday: { type: Date },
      website: { type: String },
      picture: { type: String }
    },
    passports: {
      type: [
        {
          providerName: {
            type: String,
            required: true,
            enum: ["facebook", "google"]
          },
          thirdUserId: { type: String, required: true },
          profile: {}
        }
      ],
      default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    toJSON: {
      transform(doc, ret, options = {}) {
        const displayName = getDisplayName(ret, options);
        if (!ret.displayName) {
          ret.displayName = displayName;
        }
        return ret;
      }
    }
  }
);

userSchema.index({ email: 1, isActive: 1 });

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next();
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
  return Math.random()
    .toString(36)
    .substr(2, length);
}

function getDisplayName(ret, options = {}) {
  if (ret.diaplayName) {
    return ret.diaplayName;
  }
  const lang = options.lang || "zh";
  let displayName = "";
  if (ret.profile) {
    const { zhName, firstName, lastName } = ret.profile;
    if (lang === "zh") {
      if (!displayName && firstName && lastName) {
        displayName = `${lastName}${firstName}`;
      }
    } else {
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
      } else if (firstName) {
        displayName = firstName;
      } else if (lastName) {
        displayName = lastName;
      }
    }
  }
  if (ret.email && !displayName) {
    displayName = ret.email.substring(0, ret.email.indexOf("@"));
  }
  return displayName;
}

userSchema.methods.getDisplayName = function(options) {
  return getDisplayName(this, options);
};

userSchema.methods.getBasicInfo = function(options) {
  const { _id, avatarURL } = this;
  let { displayName } = this;
  if (!displayName) {
    displayName = this.getDisplayName(options);
  }
  if (!_id) {
    throw new Error("getBasicInfo require _id filed");
  }
  const basicInfo = _.omitBy(
    {
      _id,
      avatarURL,
      displayName
    },
    _.isEmpty
  );
  return basicInfo;
};

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  if (!this.password) {
    throw new Error("comparePassword require password filed");
  }
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

export default mongoose.model("User", userSchema);
