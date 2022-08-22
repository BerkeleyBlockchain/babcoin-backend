const express = require("express");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const Event = require("../models/Event");
const { eventNames } = require("../models/Requirement");
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;

require("dotenv").config();

const router = express.Router();

////
// B@B Users API
////

router.get("/", async function (req, res) {
  const { id, address } = req.query;

  try {
    let filter = {};
    if (id) {
      filter._id = id;
    }
    if (typeof address !== "undefined" && address) {
      filter.address = address.toLowerCase();
    }

    let users = await User.find(filter);
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/", async function (req, res) {
  var { name, email, address, role } = req.body;

  if (!name || !email || !address || !role) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    var newUser = new User({
      name,
      email,
      address,
      role,
      nonce: Math.floor(Math.random() * 1000000),
    });
    await newUser.save();
    return res.status(200).json(newUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/login", async function (req, res) {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const msg = `I am signing my one-time nonce: ${user.nonce}`;

    // We now are in possession of msg, publicAddress and signature. We
    // can perform an elliptic curve signature verification with ecrecover
    const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
    const signedAddress = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature,
    });

    // The signature verification is successful if the address found with
    // ecrecover matches the initial publicAddress
    if (address.toLowerCase() !== signedAddress.toLowerCase()) {
      return res.status(401).send({ error: "Signature verification failed" });
    }

    const token = jwt.sign(
      { _id: user._id.toString(), address },
      process.env.JWT_SECRET
    );
    user.nonce = Math.floor(Math.random() * 10000);
    user.tokens = user.tokens.concat({ token });

    await user.save();
    return res.status(200).json({ ...user, token });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all event ids a user has been to
router.get("/events", async function (req, res) {
  const { address } = req.query;
  if (typeof address === "undefined" || !address) {
    return res.status(400).json({
      error: "Missing required field: address",
    });
  }

  try {
    let user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        error: "No User found",
      });
    }

    let userEvents = await UserEvent.find({ userId: user._id });
    let events = [];
    // Get all users that attended that event
    for (let userEvent of userEvents){
      var o_id = ObjectID(userEvent.eventId);
      let event = await Event.findOne({ _id:  o_id});
      if (!event) {
        return res.status(400).json({
          error: "No Event found",
        });
      }
      events.push(event);
    }
    return res.status(200).json(events);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/attend-event", auth, async function (req, res) {
  const { address, eventId } = req.body;
  if (typeof address === "undefined" || !address) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        error: "No User found",
      });
    }

    let event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(400).json({
        error: "No Event found",
      });
    }

    let newUserEvent = new UserEvent({
      userId: user._id,
      eventId,
    });
    await newUserEvent.save();
    return res.status(200).json(newUserEvent);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
