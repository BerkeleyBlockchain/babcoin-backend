const express = require("express");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const Event = require("../models/Event");
const { eventNames } = require("../models/Requirement");
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { mergeBatchResults } = require("mongodb/lib/bulk/common");
var ObjectID = require("mongodb").ObjectID;

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
  const { name, address, role } = req.body;

  if (!name || !address || !role) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    var newUser = new User({
      name,
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

router.get("/scores", async function (req, res) {
  const { startTime, endTime } = req.query;

  try {
    const users = await User.find();

    let filter = {};
    if (startTime) {
      filter.startTimestamp = { $gte: startTime };
    }
    if (endTime) {
      filter.endTimestamp = { $lte: endTime };
    }

    const eventsArray = await Event.find(filter);
    const events = {};
    eventsArray.forEach((event) => (events[event._id] = event));

    const promises = users.map(async (user) => {
      let attendedEvents = await UserEvent.find({ userId: user._id });
      let score = 0;
      attendedEvents.forEach(
        (record) =>
          (score += events[record.eventId] ? events[record.eventId].weight : 0)
      );
      return { ...user.toJSON(), score };
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => b.score - a.score);

    return res.status(200).json(results);
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
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

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Get all event ids a user has been to
router.get("/events", async function (req, res) {
  const { address, type, startTime, endTime } = req.query;
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

    for (let userEvent of userEvents) {
      const o_id = ObjectID(userEvent.eventId);
      const event = await Event.findOne({ _id: o_id });
      if (!event) {
        return res.status(400).json({
          error: "No Event found",
        });
      }

      // Filter out the event id if outside of time bounds
      if (startTime && event.startTimestamp < startTime) {
        continue;
      } else if (endTime && endTime < event.endTimestamp) {
        continue;
      }

      // If type passed into API
      if (!type || type == event.type) {
        events.push(event);
      }
    }
    return res.status(200).json(events);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/attend-event", async function (req, res) {
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

    if (event.endTimestamp + 86400000 < Date.now()) {
      return res.status(400).json({
        error: "Event has ended",
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
