const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến schema của User (đã được định nghĩa trước đó)
    required: true,
  },
  todo: [
    {
      text: {
        type: String,
        required: true,
      },
      note: String,
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      color: String,
      status: {
        type: String,
        default: "",
      },
    },
  ],
  inProgress: [
    {
      text: {
        type: String,
        required: true,
      },
      note: String,
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      color: String,
      status: {
        type: String,
        default: "",
      },
    },
  ],
  done: [
    {
      text: {
        type: String,
        required: true,
      },
      note: String,
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      color: String,
      status: {
        type: String,
        default: "",
      },
    },
  ],
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
