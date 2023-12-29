const express = require("express");
const app = express();
const port = 3003;
const mongoose = require("mongoose");
const route = require("./src/routers");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import thư viện CORS
const db = require("./src/config/db");
db.connect();

// Sử dụng middleware CORS
app.use(cors());

app.use(bodyParser.json());

app.get("/trang-chu", (req, res) => {
  return res.send("Hello World!");
});

route(app);

app.listen(port, () => console.log("Example app listening at localhost port"));
