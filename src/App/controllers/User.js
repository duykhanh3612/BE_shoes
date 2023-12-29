const UserModel = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        token = jwt.sign(payload, username + password, { expiresIn: "30m" });
        refreshToken = jwt.sign({}, username + password, { expiresIn: "3d" });
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
      res
        .status(201)
        .json({ message: "User registered successfully", newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new User();
