const express = require("express");
const app = express();
const port = 3003;
const mongoose = require("mongoose");
const route = require("./src/routers");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/config/db");
const crypto = require("crypto");
const multer = require("multer"); // Import thư viện multer

db.connect();

app.use(cors());
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục để lưu trữ tệp tin
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên tệp tin: timestamp-tên_gốc
  },
});

const upload = multer({ storage: storage });

// Middleware để xử lý tệp tin được tải lên
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send("File uploaded successfully!");
});

const secretKey = crypto.randomBytes(32).toString("hex");
app.set("secretKey", secretKey);

app.get("/trang-chu", (req, res) => {
  return res.send("Hello World!");
});

route(app);

app.listen(port, () => console.log("Example app listening at localhost port: "+port));
