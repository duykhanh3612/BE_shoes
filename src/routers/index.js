const user = require("./User");
const task = require("./Task");
const product = require("./Product");
function route(app) {
  app.use("/user", user);
  app.use("/task", task);
  app.use("/product", product);
}

module.exports = route;
