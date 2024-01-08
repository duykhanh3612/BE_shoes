const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();

class User {
  async login(req, res) {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username: username });
    let token, refreshToken;
    try {
      if (!user) {
        // Không tìm thấy tài khoản với username nàt
        return res.status(400).json({ error: "Can't find username" });
      }

      if (user.accountLocked && currentTime < user.accountLockExpires) {
        return res.json({
          message: "Account has been locked. Please try again later.",
        });
      }
      // Conpare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // Mật khẩu khớp , cho phép đăng nhập
        // Tạo JWT token và gán vào biến token
        const payload = {
          userId: user._id,
          fullname: user.fullname,
          username: user.username,
        };

        const refreshTokenPayload = {
          userId: user._id,
        };

        const secretKey = req.app.get("secretKey");

        console.log("secretKey in User", secretKey);
        token = jwt.sign(payload, secretKey, { expiresIn: "30m" });
        refreshToken = jwt.sign(refreshTokenPayload, secretKey, {
          expiresIn: "3d",
        });
        return res.status(201).json({
          message: "Success",
          token: token, // Gửi token về client
          refreshToken: refreshToken,
        });
      } else {
        return res.json({ message: "Email or password is incorrect" });
      }
    } catch (error) {
      console.log(error);
      return res.json({ message: "Internal server error" });
    }
  }

  async register(req, res) {
    const { fullname, username, password, confirmPassword } = req.body;

    function generateRSAKeyPair(username, password) {
      // Combine username and password to create a unique seed
      const seed = username + password;

      // Use a secure hash function (e.g., SHA-256) to create a seed buffer
      const seedBuffer = crypto.createHash("sha256").update(seed).digest();

      // Generate RSA key pair using the seed buffer
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicExponent: 65537,
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        seed: seedBuffer,
      });

      return { publicKey, privateKey };
    }

    try {
      // Check for required fields
      if (!fullname || !username || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if the username is already taken
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      // Check if password and confirmPassword match
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      // Check password criteria using regular expressions
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        });
      }

      const { publicKey, privateKey } = generateRSAKeyPair(username, password);

      //   // Hash the password before saving it to the database
      //   const hashedPassword = await bcrypt.hash(password, 10);

      // Save the user to the database
      const newUser = new UserModel({
        fullname,
        username,
        password,
        publicKey,
        privateKey,
      });
      await newUser.save();
      const newTask = new TaskModel({
        userId: newUser._id,
        todo: [], // or inProgress or done depending on your logic
        inProgress: [],
        done: [],
      });
      await newTask.save();
      res
        .status(201)
        .json({ message: "User registered successfully", newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  verifyToken(req, res) {
    // Lấy token từ tiêu đề Authorization
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    let responseSent = false;

    const secretKey = req.app.get("secretKey");

    // Kiểm tra tính hợp lệ và thời gian hết hạn của token
    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        if (!responseSent) {
          // Chưa gửi phản hồi, gửi phản hồi lỗi
          res.status(401).json({ message: "Invalid token" });
          responseSent = true;
        }
      } else {
        // Kiểm tra thời gian hết hạn của token
        const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại dưới dạng giây

        if (decoded.exp && decoded.exp < currentTime) {
          // Token đã hết hạn
          res.status(401).json({ message: "Token has expired" });
          responseSent = true;
        } else {
          // Token hợp lệ, tiếp tục xử lý
          req.decoded = decoded;

          if (!responseSent) {
            // Gửi phản hồi thành công nếu chưa gửi
            res.status(200).json({ message: "Token is valid" });
            responseSent = true;
          }
        }
      }
    });
  }

  refreshToken(req, res) {
    const refreshToken = req.headers["authorization"];

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is missing" });
    }

    const secretKey = req.app.get("secretKey");

    console.log("secretKey in refreshToken : ", secretKey);

    console.log("refreshToken : ", refreshToken);

    jwt.verify(refreshToken.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Tạo một token mới và gửi về cho client
      const newToken = jwt.sign({ userId: decoded.userId }, secretKey, {
        expiresIn: "15m",
      });

      res.json({ token: newToken });
    });
  }
}

module.exports = new User();
