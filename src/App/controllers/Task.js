const TaskModel = require("../models/Task");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

class User {
  async createTask(req, res) {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // Kiểm tra xem token có đúng định dạng Bearer không
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid  token format" });
    }

    // Lấy phần token sau "Bearer "
    const tokenValue = token.slice(7);

    const secretKey = req.app.get("secretKey");

    console.log(secretKey);

    const decodedToken = jwt.verify(tokenValue, secretKey);

    // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    const userId = decodedToken.userId;

    console.log("userId in Task", userId);

    const { status, text, note, endDate } = req.body;

    // Create TaskItem
    const taskItem = {
      text,
      note,
      startDate: new Date().toISOString(), // Convert to ISO string
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    try {
      let result; // Biến để lưu kết quả thêm vào mảng

      console.log(status);
      console.log(userId);

      // Kiểm tra giá trị của status và thêm dữ liệu vào mảng tương ứng
      switch (status) {
        case "todo":
          result = await TaskModel.findOneAndUpdate(
            { userId: userId },
            { $push: { todo: taskItem } },
            { new: true, upsert: true }
          );
          return res
            .status(201)
            .json({ message: "Task created successfully", result });

          break;
        case "inProgress":
          result = await TaskModel.findOneAndUpdate(
            { userId: userId },
            { $push: { inProgress: taskItem } },
            { new: true, upsert: true }
          );
          return res
            .status(201)
            .json({ message: "Task created successfully", result });
          break;
        case "done":
          result = await TaskModel.findOneAndUpdate(
            { userId: userId },
            { $push: { done: taskItem } },
            { new: true, upsert: true }
          );
          return res
            .status(201)
            .json({ message: "Task created successfully", result });
          break;
        default:
          return res.status(400).json({ error: "Invalid status" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTask(req, res) {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // Kiểm tra xem token có đúng định dạng Bearer không
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid  token format" });
    }

    // Lấy phần token sau "Bearer "
    const tokenValue = token.slice(7);

    const secretKey = req.app.get("secretKey");

    const decodedToken = jwt.verify(tokenValue, secretKey);

    // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    const userId = decodedToken.userId;

    const { status, index, text, note, endDate } = req.body;

    let arrayFieldName;
    switch (status) {
      case "todo":
        arrayToUpdate = "todo";
        arrayFieldName = "todo";
        break;
      case "inProgress":
        arrayToUpdate = "inProgress";
        arrayFieldName = "inProgress";
        break;
      case "done":
        arrayToUpdate = "done";
        arrayFieldName = "done";
        break;
      default:
        return res.status(400).json({ error: "Invalid status" });
    }

    const query = { userId };
    const projection = { [arrayFieldName]: 1 };

    try {
      const result = await TaskModel.findOne(query, projection);
      if (result) {
        if (index < result.todo.length) {
          // Update the specific element at the found index
          result.todo[index].text = text; // Replace with the new text value
          result.todo[index].note = note; // Replace with the new note value

          // Save the updated document
          try {
            const updatedResult = await result.save();
            return res.status(200).json({
              message: "Task updated successfully",
              updatedTask: updatedResult.todo[index],
            });
          } catch (error) {
            console.error("Error saving updated task:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Task not found in the todo array" });
        }
      } else {
        return res.status(400).json({ error: "Failed to find user tasks" });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteTask(req, res) {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // Kiểm tra xem token có đúng định dạng Bearer không
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid  token format" });
    }

    // Lấy phần token sau "Bearer "
    const tokenValue = token.slice(7);

    const secretKey = req.app.get("secretKey");

    const decodedToken = jwt.verify(tokenValue, secretKey);

    // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    const userId = decodedToken.userId;

    const { status, index } = req.params;
    console.log(status, index);

    let arrayFieldName;
    let arrayToUpdate;
    switch (status) {
      case "todo":
        arrayToUpdate = "todo";
        arrayFieldName = "todo";
        break;
      case "inProgress":
        arrayToUpdate = "inProgress";
        arrayFieldName = "inProgress";
        break;
      case "done":
        arrayToUpdate = "done";
        arrayFieldName = "done";
        break;
      default:
        return res.status(400).json({ error: "Invalid status" });
    }
    const query = { userId };
    const projection = { [arrayFieldName]: 1 };
    try {
      const result = await TaskModel.findOne(query, projection);
      if (result) {
        if (index < result.todo.length) {
          // Remove the element at the specified index
          result.todo.splice(index, 1);
          // Save the updated document
          try {
            const updatedResult = await result.save();
            return res.status(200).json({
              message: "Task removed successfully",
            });
          } catch (error) {
            console.error("Error saving updated task:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Task not found in the todo array" });
        }
      } else {
        return res.status(400).json({ error: "Failed to find user tasks" });
      }
    } catch (error) {
      console.error("Error removing task:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new User();
