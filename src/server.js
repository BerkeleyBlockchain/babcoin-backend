require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRouter = require("./routes/userRouter");
const eventRouter = require("./routes/eventRouter");

const port = process.env.PORT ? process.env.PORT : 4000;
console.log(process.env.MONGOOSE);

mongoose.connect(process.env.MONGOOSE, {
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

app.use("/v2/user/", userRouter);
app.use("/v2/event/", eventRouter);

// Get all events a user has gone to
// app.get("/v1/userevents/:id", async function (req, res) {
//   const client = await MongoClient.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   try {
//     const db = client.db(babcoin_db);
//     var o_id = req.params.id;
//     const userevents = db.collection(collection_userevents).find().toArray();
//     userevents.find({ user_id: o_id }).then(function (doc) {
//       if (!doc) throw new Error("No record found.");
//       console.log(doc);
//       return res.json(doc);
//     });
//   } catch (err) {
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await client.close();
//   }
// });

// Get specific event object
// app.get("/v1/event/:id", async function (req, res) {
//   const client = await MongoClient.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   try {
//     const db = client.db(babcoin_db);
//     const events = db.collection(collection_events);
//     var o_id = req.params.id;
//     events.find({ user_id: o_id }).then(function (doc) {
//       if (!doc) throw new Error("No record found.");
//       console.log(doc);
//       return res.json(doc);
//     });
//   } catch (err) {
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await client.close();
//   }
// });

// Get subset of event object for nft metadata
// app.get("/v1/nft/:id", async function (req, res) {
//   const client = await MongoClient.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   try {
//     const db = client.db(babcoin_db);
//     const events = db.collection(collection_events);
//     var o_id = req.params.id;
//     events.find({ user_id: o_id }).then(function (doc) {
//       if (!doc) throw new Error("No record found.");
//       console.log(doc);
//       return res.json(doc);
//     });
//   } catch (err) {
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await client.close();
//   }
// });

// Get all events
// app.get("/v1/events", async function (req, res) {
//   try {
//     mongoose.connect(consts.uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     const conSuccess = mongoose.connection;
//     conSuccess.once("open", async function (_) {
//       const filter = {};
//       const events = await Events.find(filter);
//       return res.json(events);
//     });
//   } catch (err) {
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await mongoose.connection.close();
//   }
// });

// async function getNextSequenceValue(schema) {
//   var max_doc = await schema.findOne().sort("-_id");
//   if (!max_doc || !max_doc._id) {
//     return 1;
//   }
//   return max_doc._id + 1;
// }

// Create a user
// app.post("/v1/user", async function (req, res) {
//   try {
//     mongoose.connect(consts.uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const conSuccess = mongoose.connection;
//     conSuccess.once("open", async function (_) {
//       var new_id = await getNextSequenceValue(Users);
//       var new_user = new Users({
//         _id: new_id,
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         email: req.body.email,
//         wallet_address: req.body.wallet_address,
//         role: req.body.role,
//       });
//       await new_user.save(function (err, user) {
//         if (err) {
//           console.log("new user save error");
//           console.error(err);
//           return res.json(err);
//         }
//         return res.json(user);
//       });
//     });
//   } catch (err) {
//     console.log("new user catch error");
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await mongoose.connection.close();
//   }
// });

// Create an event
// app.post("/v1/event", async function (req, res) {
//   try {
//     mongoose.connect(consts.uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     const conSuccess = mongoose.connection;
//     conSuccess.once("open", async function (_) {
//       var new_id = await getNextSequenceValue(Events);
//       var new_event = new Events({
//         _id: new_id,
//         start_timestamp: req.body.start_timestamp,
//         end_timestamp: req.body.end_timestamp,
//         name: req.body.name,
//         type: req.body.type,
//         role: req.body.role,
//         image_url: req.body.image_url,
//         qrcode_url: req.body.qrcode_url,
//       });
//       await new_event.save(function (err, event) {
//         if (err) {
//           console.log("new event save error");
//           console.error(err);
//           return res.json(err);
//         }
//         return res.json(event);
//       });
//     });
//   } catch (err) {
//     console.log("new event catch error");
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await mongoose.connection.close();
//   }
// });

// Create an userevent
// app.post("/v1/userevent", async function (req, res) {
//   try {
//     mongoose.connect(consts.uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     const conSuccess = mongoose.connection;
//     conSuccess.once("open", async function (_) {
//       var new_id = await getNextSequenceValue(Userevents);
//       var new_userevent = new Userevents({
//         _id: new_id,
//         event_id: req.body.event_id,
//         user_id: req.body.user_id,
//       });
//       await new_userevent.save(function (err, userevent) {
//         if (err) {
//           console.log("new event save error");
//           console.error(err);
//           return res.json(err);
//         }
//         return res.json(userevent);
//       });
//     });
//   } catch (err) {
//     console.log("new event catch error");
//     console.log(err);
//     return res.json(err);
//   } finally {
//     await mongoose.connection.close();
//   }
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = { app };
