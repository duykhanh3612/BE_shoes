const TaskModel = require("../models/Task");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const express = require("express");
const Task = require("../models/Task");
const app = express();

class User {
  async createTask(req, res) {
    // const token = req.headers["authorization"];

    // if (!token) {
    //   return res.status(401).json({ error: "Token not provided" });
    // }

    // // Kiểm tra xem token có đúng định dạng Bearer không
    // if (!token.startsWith("Bearer ")) {
    //   return res.status(401).json({ error: "Invalid  token format" });
    // }

    // // Lấy phần token sau "Bearer "
    // const tokenValue = token.slice(7);

    // const secretKey = req.app.get("secretKey");

    // console.log(secretKey);

    // const decodedToken = jwt.verify(tokenValue, secretKey);

    // // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    // const userId = decodedToken.userId;

    const userId = "65d9ac4754117f51c3e2ee07";

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

    let arrayFieldName,arrayToUpdate;
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

  async getAllTask(req, res) {
    // const token = req.headers["authorization"];
    // if (!token) {
    //   return res.status(401).json({ error: "Token not provided" });
    // }

    // // Kiểm tra xem token có đúng định dạng Bearer không
    // if (!token.startsWith("Bearer ")) {
    //   return res.status(401).json({ error: "Invalid  token format" });
    // }

    // // Lấy phần token sau "Bearer "
    // const tokenValue = token.slice(7);

    // const secretKey = req.app.get("secretKey");

    // const decodedToken = jwt.verify(tokenValue, secretKey);

    // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    // const userId = decodedToken.userId;

    function sortByEndDate(taskArray) {
      console.log(taskArray);
      return taskArray.sort(
        (a, b) => new Date(a.endDate) - new Date(b.endDate)
      );
    }

    function processArray(taskArray) {
      return taskArray.map((task) => {
        const currentDate = new Date();
        const endDate = new Date(task.endDate);
        const timeDifference = endDate - currentDate;
        const daysDifference = Math.ceil(
          timeDifference / (1000 * 60 * 60 * 24)
        );
        if (timeDifference < 0) {
          task.status = "Overdue";
        } else if (daysDifference < 3) {
          task.status = "Upcoming";
        } else {
          task.status = "";
        }

        return task;
      });
    }

    const userId = "659912ffb326d839860ea7a1";

    const tasksData = await TaskModel.find({ userId: userId });

    const tasks = tasksData[0];

    // Sort
    tasks.todo = sortByEndDate(tasks.todo);
    tasks.inProgress = sortByEndDate(tasks.inProgress);
    tasks.done = sortByEndDate(tasks.done);

    console.log("Tasks Done : ", tasks.done);

    // Xử lý mỗi mảng
    tasks.todo = processArray(tasks.todo);
    tasks.inProgress = processArray(tasks.inProgress);
    tasks.done = processArray(tasks.done);

    console.log("tasks.: ", tasks.done);

    res.status(200).json({ tasks });
  }

  async moveTask(req, res) {
    // const token = req.headers["authorization"];
    // if (!token) {
    //   return res.status(401).json({ error: "Token not provided" });
    // }

    // // Kiểm tra xem token có đúng định dạng Bearer không
    // if (!token.startsWith("Bearer ")) {
    //   return res.status(401).json({ error: "Invalid  token format" });
    // }

    // // Lấy phần token sau "Bearer "
    // const tokenValue = token.slice(7);

    // const secretKey = req.app.get("secretKey");

    // const decodedToken = jwt.verify(tokenValue, secretKey);

    // // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    // const userId = decodedToken.userId;
    const userId = "659912ffb326d839860ea7a1";
    const tasksData = await TaskModel.find({ userId: userId });

    const { fromArray, indexA, toArray } = req.body;

    // Move task

    // Check if the specified arrays (fromArray and toArray) are valid
    if (!tasksData[0][fromArray] || !tasksData[0][toArray]) {
      // Handle invalid array names
      console.error("Invalid array names");
      return;
    }

    // Assuming tasksData is an array with the structure you provided
    const taskToMove = tasksData[0][fromArray][indexA];

    // Check if the task exists at the specified index in the fromArray
    if (taskToMove) {
      // Remove the task from the fromArray
      const movedTask = tasksData[0][fromArray].splice(indexA, 1)[0];

      // Set the status for the moved task (replace 'statusA' with the desired status)
      movedTask.status = "statusA";

      // Push the moved task to the toArray
      tasksData[0][toArray].push(movedTask);

      // Save the updated data to the database
      const updatedTask = await TaskModel.findOneAndUpdate(
        { userId: userId },
        tasksData[0],
        { new: true, upsert: true }
      );
      res.status(201).json({ updatedTask: updatedTask });
    }
  }
}

module.exports = new User();
