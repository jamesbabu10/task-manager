const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true }
);

const task = mongoose.model("task", taskSchema);

module.exports = task;
