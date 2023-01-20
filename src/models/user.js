const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      validate(value) {
        if (value.includes("password"))
          throw new Error("password can not contain the word password");
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Email is invalid");
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) throw new Error("the age must be positive");
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

userSchema.virtual("tasks", {
  ref: "task",
  localField: "_id",
  foreignField: "owner",
});

//this way we can make our own functions
//static methods are accesible on the model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("email wrong to login");
  }

  const ismatch = await bcrypt.compare(password, user.password);
  if (!ismatch) {
    throw new Error("password wrong to login");
  }
  return user;
};

//methods are methods accessible on the instance
userSchema.methods.generateauthtoken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userobject = user.toObject();
  delete userobject.password;
  delete userobject.tokens;
  delete userobject.avatar;
  return userobject;
};

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

//this will run before the save operation is performed
userSchema.pre("save", async function (next) {
  const user = this;

  //is modified mein we pass the field which have to keep track of
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  console.log("just before saving");

  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
