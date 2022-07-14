const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");

require("dotenv").config();

const router = express.Router();

//// Users
// B@B Users API
////

router.get("/", async function (req, res) {
  const { id, address } = req.query;

  let users = [];
  try {
    let filter = {};
    if (id) {
      filter = { id: id };
    }
    if (address) {
      filter = { address: address };
    }
    users = await User.find(filter);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }

  return users;
});

// Get all events a user has gone to
app.get("/v1/userevents/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(babcoin_db);
    var o_id = req.params.id;
    const userevents = db.collection(collection_userevents).find().toArray();
    userevents.find({ user_id: o_id }).then(function (doc) {
      if (!doc) throw new Error("No record found.");
      console.log(doc);
      return res.json(doc);
    });
  } catch (err) {
    console.log(err);
    return res.json(err);
  } finally {
    await client.close();
  }
});

// Get specific event object
app.get("/v1/event/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(babcoin_db);
    const events = db.collection(collection_events);
    var o_id = req.params.id;
    events.find({ user_id: o_id }).then(function (doc) {
      if (!doc) throw new Error("No record found.");
      console.log(doc);
      return res.json(doc);
    });
  } catch (err) {
    console.log(err);
    return res.json(err);
  } finally {
    await client.close();
  }
});
