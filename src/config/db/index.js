const mongoose = require("mongoose");

async function connect() {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(
      "mongodb+srv://khanhdz3612:mai2kquenem@cluster0.0skp7cz.mongodb.net/DB_shoes"
    );
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connect };
