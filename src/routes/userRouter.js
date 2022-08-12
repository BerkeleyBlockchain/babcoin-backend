const express = require("express");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const Event = require("../models/Event");
const { eventNames } = require("../models/Requirement");

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
      filter.address = address;
    }

    let users = await User.find(filter);
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/", async function (req, res) {
  const { name, email, address, role } = req.body;

  if (!name || !email || !address || !role) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let lowerAddress = address.toLowerCase();
    var new_user = new User({
      name,
      email,
      lowerAddress,
      role,
    });
    await new_user.save();
    return res.status(200).json(new_user);
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
    if (!user) throw new Error("No record found.");

    let events = await UserEvent.find({ user_id: user._id });

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
    if (!user) throw new Error("No user found.");

    let event = await Event.findOne({ _id: eventId });
    if (!event) throw new Error("No event found.");

    console.log(user);
    console.log(user._id);

    var newUserEvent = new UserEvent({
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
