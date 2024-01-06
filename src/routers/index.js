const user = require("./User");
const task = require("./Task");

function route(app) {
  app.use("/user", user);
  app.use("/task", task);
}

module.exports = route;
