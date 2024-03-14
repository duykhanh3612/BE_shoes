const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

class User {
  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "Can't find username" });
      }

      if (user.accountLocked && currentTime < user.accountLockExpires) {
        return res.json({
          message: "Account has been locked. Please try again later.",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const payload = {
          userId: user._id,
          email: user.email,
          role: user.role,
        };

        const refreshTokenPayload = {
          userId: user._id,
        };

        const secretKey = req.app.get("secretKey");

        const token = jwt.sign(payload, secretKey, { expiresIn: "30m" });
        const refreshToken = jwt.sign(refreshTokenPayload, secretKey, {
          expiresIn: "3d",
        });

        return res.status(201).json({
          message: "Success",
          role: user.role,
          token,
          refreshToken,
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
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

      function generateRSAKeyPair(email, password) {
        const seed = email + password;
        const seedBuffer = crypto.createHash("sha256").update(seed).digest();

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
        if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
          return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
          return res.status(400).json({ error: "Username is already taken" });
        }

        if (password !== confirmPassword) {
          return res.status(400).json({ error: "Passwords do not match" });
        }

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            error: "Password must meet specified criteria",
          });
        }

        const { publicKey, privateKey } = generateRSAKeyPair(email, password);

        const newUser = new UserModel({
          firstName,
          lastName,
          email,
          password,
          publicKey,
          privateKey,
        });

      await  newUser.save();
      if(newUser){
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "leduykhanhqn123@gmail.com",
            pass: "gcbf jgwe ptph grgc",
          },
        });
        const mailOptions = {
          from: "leduykhanhqn123@gmail.com",
          to: email,
          subject: "Registration Successful",
          text: "Thank you for registering! Your account has been successfully created.",
        };
        transporter.sendMail(mailOptions);   
        res.status(201).json({ message: "User registered successfully", newUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  verifyToken(req, res) {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    let responseSent = false;

    const secretKey = req.app.get("secretKey");

    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        if (!responseSent) {
          res.status(401).json({ message: "Invalid token" });
          responseSent = true;
        }
      } else {
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < currentTime) {
          res.status(401).json({ message: "Token has expired" });
          responseSent = true;
        } else {
          req.decoded = decoded;

          if (!responseSent) {
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

    jwt.verify(refreshToken.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const newToken = jwt.sign({ userId: decoded.userId }, secretKey, {
        expiresIn: "15m",
      });

      res.json({ token: newToken });
    });
  }

  async sendVerificationCode(req, res) {
    const { email } = req.body;

    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "Email không tồn tại" });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      user.passwordResetToken = verificationCode;
      user.passwordResetExpires = Date.now() + 2 * 60 * 1000;

      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "leduykhanhqn123@gmail.com",
          pass: "gcbf jgwe ptph grgc",
        },
      });

      const mailOptions = {
        from: "leduykhanhqn123@gmail.com",
        to: email,
        subject: "Mã Xác Nhận để Đặt Lại Mật Khẩu",
        text: `Mã xác nhận của bạn là: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "Mã xác nhận đã được gửi thành công" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Không thể gửi mã xác nhận qua email" });
    }
  }

  async verifyVerificationCode(req, res) {
    const { email, verificationCode } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại" });
    }

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== verificationCode ||
      user.passwordResetExpires < Date.now()
    ) {
      return res.status(400).json({ error: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    return res.status(200).json({ message: "Mã xác nhận hợp lệ" });
  }

  async resetPassword(req, res) {
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại" });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  }
}

module.exports = new User();
