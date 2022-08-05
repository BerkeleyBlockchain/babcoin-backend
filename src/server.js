console.log("Server launched");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRouter = require("./routes/userRouter");
const eventRouter = require("./routes/eventRouter");
const reqRouter = require("./routes/reqRouter");

const port = process.env.PORT ? process.env.PORT : 4000;
console.log(port);

const url = process.env.MONGOOSE
  ? process.env.MONGOOSE
  : "mongodb://127.0.0.1:27017/babcoin";
console.log(url);

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected successfully!");
});
db.on("error", (err) => {
  console.error(`Error while connecting to DB: ${err.message}`);
});

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/v1/user/", userRouter);
app.use("/v1/event/", eventRouter);
app.use("/v1/requirement/", reqRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// async function getNextSequenceValue(schema) {
//   var max_doc = await schema.findOne().sort("-_id");
//   if (!max_doc || !max_doc._id) {
//     return 1;
//   }
//   return max_doc._id + 1;
// }

module.exports = { app };
